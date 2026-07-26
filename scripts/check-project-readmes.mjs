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

function projectHasGithub(file) {
  try {
    const project = JSON.parse(readFileSync(file, "utf8"));
    return typeof project.github === "string" && project.github.trim() !== "";
  } catch {
    // A malformed project JSON is a problem for whatever reads it as project
    // data (tina-helpers' own parsing) — this guard only cares about README
    // coverage, so an unparsable file just can't require a snapshot.
    return false;
  }
}

function main() {
  const problems = [];

  // Slugs whose project.json declares a github field — these must have
  // either a mirrored snapshot or a "checked, nothing to mirror" sentinel.
  const githubSlugs = new Set();
  // Every routable project slug, github or not — lets the orphan pass below
  // tell "no such project" apart from "project exists but isn't github-linked".
  const knownSlugs = new Set();

  for (const file of readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".json"))) {
    const slug = path.basename(file, ".json");
    // An invalid slug never resolves to a route (getAllProjects skips it the
    // same way), so it can't be the subject of either failure class below.
    if (!isValidSlug(slug)) continue;
    knownSlugs.add(slug);
    if (projectHasGithub(path.join(PROJECTS_DIR, file))) {
      githubSlugs.add(slug);
    }
  }

  for (const slug of githubSlugs) {
    const mdPath = path.join(README_DIR, `${slug}.md`);
    const sentinelPath = path.join(README_DIR, `${slug}.no-readme`);
    if (!existsSync(mdPath) && !existsSync(sentinelPath)) {
      problems.push(
        `${slug}: has a github field but no snapshot or sentinel in ${README_DIR} — run: node scripts/refresh-project-readme.mjs ${slug}`
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
