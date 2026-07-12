import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from "fs";
import path from "path";
import { createHash } from "crypto";

const PROJECTS_DIR = "content/projects";
const README_DIR = "content/project-readmes";
const ASSETS_DIR = "public/assets/projects";
const FRESH_MS = 7 * 24 * 60 * 60 * 1000;
const IMAGE_EXT_RE = /\.(png|jpe?g|gif|svg|webp|bmp|ico)$/i;
// Mirrors VALID_PROJECT_SLUG + the length cap in isValidProjectSlug
// (src/lib/tina-helpers.ts) — same reasoning as parseGitHubRepo above for
// why it's duplicated rather than imported.
const VALID_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const MAX_SLUG_LENGTH = 100;

// Mirrors parseGitHubRepo in src/lib/github-stars.ts — duplicated here because
// this script runs as plain Node ESM and can't import a TS module directly.
function parseGitHubRepo(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return `${parts[0]}/${parts[1]}`;
  } catch {
    return null;
  }
}

function isFresh(mdPath) {
  if (!existsSync(mdPath)) return false;
  const raw = readFileSync(mdPath, "utf8");
  const match = raw.match(/^fetchedAt:\s*(\S+)/m);
  if (!match) return false;
  const fetchedAt = new Date(match[1]);
  if (Number.isNaN(fetchedAt.getTime())) return false;
  return Date.now() - fetchedAt.getTime() < FRESH_MS;
}

function buildFrontmatter({ title, fetchedAt, sourceRepo, sourceBranch }) {
  const quoted = `"${title.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  return `---\ntitle: ${quoted}\nfetchedAt: ${fetchedAt}\nsourceRepo: ${sourceRepo}\nsourceBranch: ${sourceBranch}\n---\n\n`;
}

function isAbsoluteOrSkippable(url) {
  return (
    /^https?:\/\//i.test(url) ||
    url.startsWith("//") ||
    url.startsWith("#") ||
    url.startsWith("mailto:")
  );
}

function splitFragment(url) {
  const idx = url.search(/[?#]/);
  if (idx === -1) return { path: url, suffix: "" };
  return { path: url.slice(0, idx), suffix: url.slice(idx) };
}

// Returns null if relPath normalizes to outside the repo root (e.g. `../../x`)
// rather than a resolvable in-repo path.
function resolveRepoPath(baseDir, relPath) {
  const joined = relPath.startsWith("/") ? relPath : path.posix.join(baseDir, relPath);
  const normalized = path.posix.normalize(joined);
  if (normalized.startsWith("..") || normalized === ".") return null;
  return normalized.replace(/^\/+/, "");
}

function dedupeBasename(usedBasenames, resolvedPath) {
  const base = path.posix.basename(resolvedPath);
  const existing = usedBasenames.get(base);
  if (existing === undefined || existing === resolvedPath) {
    usedBasenames.set(base, resolvedPath);
    return base;
  }
  // Two different source paths want the same filename — disambiguate deterministically.
  const hash = createHash("sha1").update(resolvedPath).digest("hex").slice(0, 8);
  const disambiguated = `${hash}-${base}`;
  usedBasenames.set(disambiguated, resolvedPath);
  return disambiguated;
}

async function downloadAsset(rawUrl, headers) {
  try {
    const res = await fetch(rawUrl, { headers });
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

// Applies asyncFn to every regex match and stitches the results back in, since
// String.replace can't take an async callback.
async function replaceAsync(str, regex, asyncFn) {
  const matches = [...str.matchAll(regex)];
  const results = await Promise.all(matches.map((m) => asyncFn(...m)));
  let i = 0;
  return str.replace(regex, () => results[i++]);
}

// Fenced code blocks must survive untouched — a relative link/image ref inside
// a code sample is example text, not something to rewrite or fetch.
function splitCodeFences(markdown) {
  return markdown.split(/(```[\s\S]*?```)/g);
}

async function rewriteMarkdown(raw, { owner, repo, branch, baseDir, slug, headers }) {
  const assetOutDir = path.join(ASSETS_DIR, slug);
  const usedBasenames = new Map();
  const imageCache = new Map();
  const notes = [];

  async function resolveUrl(url, isImageContext) {
    if (isAbsoluteOrSkippable(url)) return url;
    const { path: rawPath, suffix } = splitFragment(url);
    if (!rawPath) return url;
    // README authors sometimes pre-encode spaces/specials (e.g. "My%20File.png")
    // — decode before resolving so the encode step below doesn't double-encode
    // the already-escaped path (%20 -> %2520).
    let decodedPath;
    try {
      decodedPath = decodeURIComponent(rawPath);
    } catch {
      decodedPath = rawPath;
    }
    const resolvedPath = resolveRepoPath(baseDir, decodedPath);
    if (!resolvedPath) return url;
    // resolvedPath is also used as a local path (dedupeBasename/writeFileSync)
    // and in notes — only the URL-bound copy needs escaping.
    const encodedPath = resolvedPath.split("/").map(encodeURIComponent).join("/");

    if (isImageContext || IMAGE_EXT_RE.test(rawPath)) {
      if (imageCache.has(resolvedPath)) return imageCache.get(resolvedPath);
      const rawDownloadUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodedPath}`;
      const buf = await downloadAsset(rawDownloadUrl, headers);
      if (!buf) {
        notes.push(`image not downloaded: ${resolvedPath}`);
        return url;
      }
      const basename = dedupeBasename(usedBasenames, resolvedPath);
      mkdirSync(assetOutDir, { recursive: true });
      writeFileSync(path.join(assetOutDir, basename), buf);
      const resolvedUrl = `/assets/projects/${slug}/${encodeURIComponent(basename)}`;
      imageCache.set(resolvedPath, resolvedUrl);
      return resolvedUrl;
    }

    return `https://github.com/${owner}/${repo}/blob/${branch}/${encodedPath}${suffix}`;
  }

  async function processSegment(segment) {
    segment = await replaceAsync(
      segment,
      /<img\b([^>]*?)\bsrc\s*=\s*(["'])([^"']+)\2([^>]*)>/gi,
      async (_match, pre, quote, src, post) => {
        const newSrc = await resolveUrl(src, true);
        return `<img${pre}src=${quote}${newSrc}${quote}${post}>`;
      }
    );

    segment = await replaceAsync(
      segment,
      /<a\b([^>]*?)\bhref\s*=\s*(["'])([^"']+)\2([^>]*)>/gi,
      async (_match, pre, quote, href, post) => {
        const newHref = await resolveUrl(href, false);
        return `<a${pre}href=${quote}${newHref}${quote}${post}>`;
      }
    );

    // Badge-in-link markdown (`[![alt](img)](href)`) needs both URLs rewritten
    // in one pass — matching the plain-link branch alone leaves the badge's
    // `![alt](img)` consumed but the wrapping `](href)` dangling unmatched,
    // since the wrapping `[` was already spent on the inner image match.
    // One level of balanced parens in the URL (e.g. Wikipedia's
    // Template_(C%2B%2B)) without the nested-quantifier backtracking blowup
    // CodeQL flagged in `(?:[^()]+|\(...\))+` — this shape can't produce
    // ambiguous partitions of the input, so it can't backtrack exponentially.
    segment = await replaceAsync(
      segment,
      /\[!\[([^\]]*)\]\(([^()]*(?:\([^()]*\)[^()]*)*)\)\]\(([^()]*(?:\([^()]*\)[^()]*)*)\)|(!?)\[([^\]]*)\]\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g,
      async (_match, nestedAlt, nestedImg, nestedHref, bang, text, inner) => {
        if (nestedHref !== undefined) {
          const newImg = await resolveUrl(nestedImg, true);
          const newHref = await resolveUrl(nestedHref, false);
          return `[![${nestedAlt}](${newImg})](${newHref})`;
        }
        const spaceIdx = inner.search(/\s/);
        const url = spaceIdx === -1 ? inner : inner.slice(0, spaceIdx);
        const titlePart = spaceIdx === -1 ? "" : inner.slice(spaceIdx);
        const newUrl = await resolveUrl(url, bang === "!");
        return `${bang}[${text}](${newUrl}${titlePart})`;
      }
    );

    return segment;
  }

  const segments = splitCodeFences(raw);
  const processed = await Promise.all(
    segments.map((segment, i) => (i % 2 === 1 ? segment : processSegment(segment)))
  );

  return { body: processed.join(""), notes };
}

async function processProject(file, slug, force) {
  try {
    const project = JSON.parse(readFileSync(file, "utf8"));
    if (!project.github) return "no github";

    const repo = parseGitHubRepo(project.github);
    if (!repo) return "error: malformed github URL";
    const [owner, repoName] = repo.split("/");

    const mdPath = path.join(README_DIR, `${slug}.md`);
    if (!force && isFresh(mdPath)) return "skipped (fresh)";

    const token = process.env.GITHUB_TOKEN;
    const headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "xylem-refresh-projects",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, { headers });
    if (res.status === 404) {
      // The repo dropped its README — remove any previously mirrored snapshot
      // so the detail page falls back to header-only instead of showing stale docs.
      if (existsSync(mdPath)) unlinkSync(mdPath);
      return "no readme";
    }
    if (!res.ok) return `error: GitHub API ${res.status}`;

    const data = await res.json();
    const raw = Buffer.from(data.content, "base64").toString("utf8");

    // data.path is the file's exact repo-relative path (e.g. "docs/README.md"),
    // so its dirname is baseDir regardless of branch — no URL parsing needed.
    const pathDir = path.posix.dirname(data.path);
    const baseDir = pathDir === "." ? "" : pathDir;

    // Branch names can legally contain "/" (e.g. "release/2026"), which would
    // shift a naive `download_url` split. html_url is `/<owner>/<repo>/blob/
    // <branch>/<path>` — since data.path's segment count is known, whatever's
    // left between "blob" and that known tail is the branch, however many
    // segments it has.
    const htmlUrlParts = new URL(data.html_url).pathname.split("/").filter(Boolean);
    const pathSegmentCount = data.path.split("/").filter(Boolean).length;
    const branch = htmlUrlParts.slice(3, htmlUrlParts.length - pathSegmentCount).join("/");

    const { body, notes } = await rewriteMarkdown(raw, {
      owner,
      repo: repoName,
      branch,
      baseDir,
      slug,
      headers,
    });

    mkdirSync(README_DIR, { recursive: true });
    const frontmatter = buildFrontmatter({
      title: project.title ?? slug,
      fetchedAt: new Date().toISOString().slice(0, 10),
      sourceRepo: repo,
      sourceBranch: branch,
    });
    writeFileSync(mdPath, frontmatter + body);

    for (const note of notes) console.warn(`  [${slug}] ${note}`);
    return "refreshed";
  } catch (err) {
    return `error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const slugArg = args.find((a) => a !== "--force");

  let files;
  if (slugArg) {
    if (!VALID_SLUG_RE.test(slugArg) || slugArg.length > MAX_SLUG_LENGTH) {
      console.error(`Invalid project slug: ${slugArg}`);
      process.exit(1);
    }
    const file = path.join(PROJECTS_DIR, `${slugArg}.json`);
    if (!existsSync(file)) {
      console.error(`Unknown project slug: ${slugArg}`);
      process.exit(1);
    }
    files = [file];
  } else {
    files = readdirSync(PROJECTS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => path.join(PROJECTS_DIR, f));
  }

  const tally = { refreshed: 0, "skipped (fresh)": 0, "no readme": 0, "no github": 0, error: 0 };

  for (const file of files) {
    const slug = path.basename(file, ".json");
    const status = await processProject(file, slug, force);
    const key = status.startsWith("error:") ? "error" : status;
    tally[key] = (tally[key] ?? 0) + 1;
    console.log(`${slug}: ${status}`);
  }

  console.log(
    `\nTotal: ${tally.refreshed} refreshed, ${tally["skipped (fresh)"]} fresh, ${tally["no readme"]} no readme, ${tally["no github"]} no github, ${tally.error} errors`
  );

  if (tally.error > 0) {
    process.exit(1);
  }

  if (tally.refreshed === 0 && tally["skipped (fresh)"] > 0) {
    console.log("RESULT: nothing-to-refresh");
    process.exit(3);
  }
}

main();
