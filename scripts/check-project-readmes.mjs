import { existsSync, readFileSync, readdirSync } from "fs";
import path from "path";

const PROJECTS_DIR = "content/projects";
const README_DIR = "content/project-readmes";
// Mirrors VALID_PROJECT_SLUG + the length cap in isValidProjectSlug
// (src/lib/tina-helpers.ts) — same reasoning as refresh-project-readme.mjs
// for why it's duplicated rather than imported.
const VALID_SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const MAX_SLUG_LENGTH = 100;

function isValidSlug(slug) {
  return VALID_SLUG_RE.test(slug) && slug.length <= MAX_SLUG_LENGTH;
}

// Mirrors parseGitHubRepo in refresh-project-readme.mjs (itself mirroring
// src/lib/github-stars.ts) — duplicated for the same reason: this script is
// dependency-free plain Node ESM and can't import a TS module, and keeping it
// independent of the sibling script avoids coupling two scripts that are
// meant to be runnable on their own.
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

// Returns undefined for "no github field" (or unparsable project JSON — see
// below), and otherwise `parseGitHubRepo(project.github)` — which can itself
// be null for a github field that doesn't parse as an "owner/repo" URL. That
// null case still needs a snapshot (the field is set) but has no repo string
// to compare a snapshot's recorded sourceRepo against, so the mismatch check
// below is skipped for it while the plain coverage check above still applies.
function projectGithub(file) {
  try {
    const project = JSON.parse(readFileSync(file, "utf8"));
    if (typeof project.github !== "string" || project.github.trim() === "") return undefined;
    return parseGitHubRepo(project.github);
  } catch {
    // A malformed project JSON is a problem for whatever reads it as project
    // data (tina-helpers' own parsing) — this guard only cares about README
    // coverage, so an unparsable file just can't require a snapshot.
    return undefined;
  }
}

// Both the .md snapshot and the .no-readme sentinel record the repo they
// were generated from as a `sourceRepo: "owner/repo"` frontmatter/YAML line
// (see refresh-project-readme.mjs) — pull it out with the same lenient
// pattern refresh-project-readme.mjs uses for its own freshness check.
function recordedSourceRepo(filePath) {
  const raw = readFileSync(filePath, "utf8");
  return raw.match(/^sourceRepo:\s*"?([^"\n]+?)"?\s*$/m)?.[1] ?? null;
}

function main() {
  const problems = [];

  // Slugs whose project.json declares a github field — these must have
  // either a mirrored snapshot or a "checked, nothing to mirror" sentinel.
  // Maps to the parsed "owner/repo" (or null for a github field that doesn't
  // parse as one), used below to catch a snapshot left over from a repo the
  // project no longer points at.
  const githubSlugs = new Map();
  // Every routable project slug, github or not — lets the orphan pass below
  // tell "no such project" apart from "project exists but isn't github-linked".
  const knownSlugs = new Set();

  for (const file of readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".json"))) {
    const slug = path.basename(file, ".json");
    // An invalid slug never resolves to a route (getAllProjects skips it the
    // same way), so it can't be the subject of either failure class below.
    if (!isValidSlug(slug)) continue;
    knownSlugs.add(slug);
    const repo = projectGithub(path.join(PROJECTS_DIR, file));
    if (repo !== undefined) githubSlugs.set(slug, repo);
  }

  for (const [slug, repo] of githubSlugs) {
    const mdPath = path.join(README_DIR, `${slug}.md`);
    const sentinelPath = path.join(README_DIR, `${slug}.no-readme`);
    const artifactPath = existsSync(mdPath) ? mdPath : existsSync(sentinelPath) ? sentinelPath : null;
    if (!artifactPath) {
      problems.push(
        `${slug}: has a github field but no snapshot or sentinel in ${README_DIR} — run: node scripts/refresh-project-readme.mjs ${slug}`
      );
      continue;
    }
    // A repo string to compare against — skip the mismatch check when the
    // github field didn't parse as one, same as the coverage check above
    // still applying regardless.
    if (repo === null) continue;
    const recordedRepo = recordedSourceRepo(artifactPath);
    // recordedRepo === null means an artifact predating the sourceRepo field
    // (shouldn't exist post-refresh, but don't false-positive on it) or one
    // that failed to parse — neither is evidence of an actual mismatch.
    if (recordedRepo !== null && recordedRepo !== repo) {
      // No --force needed — refresh-project-readme.mjs's own freshness check
      // already treats a sourceRepo mismatch as reason enough to re-fetch.
      problems.push(
        `${slug}: ${path.basename(artifactPath)} was generated from ${recordedRepo}, but the project's github field now points at ${repo} — run: node scripts/refresh-project-readme.mjs ${slug}`
      );
    }
  }

  const readmeFiles = existsSync(README_DIR) ? readdirSync(README_DIR) : [];
  for (const file of readmeFiles) {
    let slug;
    if (file.endsWith(".no-readme")) {
      slug = file.slice(0, -".no-readme".length);
    } else if (file.endsWith(".md")) {
      slug = file.slice(0, -".md".length);
    } else {
      continue;
    }
    if (!isValidSlug(slug) || githubSlugs.has(slug)) continue;
    const reason = knownSlugs.has(slug)
      ? "its project has no github field"
      : "no matching project JSON exists";
    problems.push(`${file}: orphaned (${reason}) — delete it or re-run the refresh script`);
  }

  if (problems.length > 0) {
    console.error("Project README check failed:");
    for (const problem of problems) console.error(`  - ${problem}`);
    process.exit(1);
  }

  console.log("Project READMEs OK: every github-linked project has a snapshot or sentinel, no orphans.");
}

main();
