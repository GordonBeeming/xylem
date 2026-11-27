import { mkdirSync, writeFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");
const yaml = require("js-yaml");
const readingTime = require("reading-time");

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content");
const outDir = path.join(root, "src/lib/generated");
const outFile = path.join(outDir, "content-snapshot.json");

function walkMarkdown(dir, ext = /\.mdx?$/) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkMarkdown(full, ext));
    else if (entry.isFile() && ext.test(entry.name)) results.push(full);
  }
  return results;
}

function iso(value) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return undefined;
}

function collectPosts() {
  const blogDir = path.join(contentDir, "blog");
  const posts = [];
  for (const filePath of walkMarkdown(blogDir)) {
    const raw = readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    if (!data.title || !data.date) continue;
    const slug = path.relative(blogDir, filePath).replace(/\.mdx?$/, "");
    const rt = readingTime(content);
    posts.push({
      meta: {
        title: data.title,
        date: iso(data.date) ?? String(data.date),
        tags: Array.isArray(data.tags) ? data.tags : [],
        lastmod: iso(data.lastmod),
        summary: data.summary ?? undefined,
        canonicalUrl: typeof data.canonicalUrl === "string" ? data.canonicalUrl : undefined,
        slug,
        readingTime: { text: rt.text, minutes: Math.ceil(rt.minutes) },
      },
      content,
    });
  }
  posts.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
  return posts;
}

function collectJsonDir(dir, mapFn) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => mapFn(file, JSON.parse(readFileSync(path.join(dir, file), "utf8"))))
    .filter(Boolean);
}

function collectProjects() {
  return collectJsonDir(path.join(contentDir, "projects"), (file, data) => {
    const slug = file.replace(/\.json$/, "");
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug) || slug.length > 100) return null;
    return {
      slug,
      title: typeof data.title === "string" ? data.title : "Untitled",
      description: typeof data.description === "string" ? data.description : "",
      href: typeof data.href === "string" ? data.href : undefined,
      imgSrc: typeof data.imgSrc === "string" ? data.imgSrc : undefined,
      techStack: Array.isArray(data.techStack)
        ? data.techStack.filter((t) => typeof t === "string")
        : [],
      github: typeof data.github === "string" ? data.github : undefined,
      appStore: typeof data.appStore === "string" ? data.appStore : undefined,
      video: typeof data.video === "string" ? data.video : undefined,
      status: typeof data.status === "string" && data.status.trim() !== "" ? data.status.trim() : undefined,
      featured: typeof data.featured === "boolean" ? data.featured : false,
      githubStars: typeof data.githubStars === "number" ? data.githubStars : undefined,
      date: typeof data.date === "string" ? data.date : undefined,
    };
  });
}

function collectProjectReadmes() {
  const dir = path.join(contentDir, "project-readmes");
  const readmes = {};
  if (!existsSync(dir)) return readmes;
  for (const file of readdirSync(dir).filter((name) => name.endsWith(".md"))) {
    const slug = file.replace(/\.md$/, "");
    const raw = readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    const fetchedAtValid =
      (data.fetchedAt instanceof Date && !Number.isNaN(data.fetchedAt.getTime())) ||
      (typeof data.fetchedAt === "string" && !Number.isNaN(Date.parse(data.fetchedAt)));
    if (
      !fetchedAtValid ||
      typeof data.sourceRepo !== "string" ||
      !data.sourceRepo.trim() ||
      typeof data.sourceBranch !== "string" ||
      !data.sourceBranch.trim() ||
      content.trim() === ""
    ) {
      continue;
    }
    const fetchedAtDate = data.fetchedAt instanceof Date ? data.fetchedAt : new Date(data.fetchedAt);
    readmes[slug] = {
      content,
      fetchedAt: fetchedAtDate.toISOString().slice(0, 10),
      sourceRepo: data.sourceRepo.trim(),
      sourceBranch: data.sourceBranch.trim(),
      visibility:
        data.visibility === "public" || data.visibility === "private" ? data.visibility : undefined,
    };
  }
  return readmes;
}

function collectBooks() {
  return collectJsonDir(path.join(contentDir, "books"), (file, data) => {
    const slug = file.replace(/\.json$/, "");
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug) || slug.length > 100) return null;
    return {
      slug,
      title: data.title ?? "Untitled",
      description: data.description ?? "",
      href: data.href ?? undefined,
      imgSrc: data.imgSrc ?? undefined,
      overview: data.overview ?? undefined,
      authors: data.authors ?? undefined,
      reviewers: data.reviewers ?? undefined,
      publisher: data.publisher ?? undefined,
      publishedDate: data.publishedDate ?? undefined,
      isbn: data.isbn ?? undefined,
      tableOfContents: data.tableOfContents ?? undefined,
    };
  });
}

function collectAuthors() {
  const dir = path.join(contentDir, "authors");
  const authors = {};
  for (const filePath of walkMarkdown(dir)) {
    const raw = readFileSync(filePath, "utf8");
    const { data, content } = matter(raw);
    const fileName = path.basename(filePath).replace(/\.mdx?$/, "");
    authors[fileName] = {
      name: data.name ?? fileName,
      avatar: data.avatar,
      profile_line_1: data.profile_line_1,
      profile_line_2: data.profile_line_2,
      company_name: data.company_name,
      company_website: data.company_website,
      company_logo_dark: data.company_logo_dark,
      company_logo_light: data.company_logo_light,
      mvp_website: data.mvp_website,
      mvp_logo_dark: data.mvp_logo_dark,
      mvp_logo_light: data.mvp_logo_light,
      email: data.email,
      twitter: data.twitter,
      bluesky: data.bluesky,
      linkedin: data.linkedin,
      github: data.github,
      layout: data.layout,
      body: content,
    };
  }
  return authors;
}

function collectSiteConfig() {
  const file = path.join(contentDir, "config", "site.json");
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

function collectNuggets() {
  const dir = path.join(contentDir, "nuggets");
  if (!existsSync(dir)) return [];
  const nuggets = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/, "");
    if (!/^[a-z0-9][a-z0-9-]*$/.test(slug) || slug.length > 100) continue;
    const yamlPath = path.join(dir, `${slug}.yaml`);
    if (!existsSync(yamlPath)) continue;
    const data = yaml.load(readFileSync(yamlPath, "utf8"));
    if (!data || typeof data !== "object" || !data.title || !data.date) continue;
    nuggets.push({
      title: data.title,
      date: data.date instanceof Date ? data.date.toISOString() : String(data.date),
      summary: typeof data.summary === "string" ? data.summary : undefined,
      tags: Array.isArray(data.tags) ? data.tags.filter((t) => typeof t === "string") : [],
      slug,
    });
  }
  nuggets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return nuggets;
}


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

async function fetchStarCount(repo) {
  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "xylem-content-snapshot",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
      signal: controller.signal,
    });
    if (!response.ok) return undefined;
    const data = await response.json();
    return typeof data.stargazers_count === "number" ? data.stargazers_count : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

async function enrichProjectsWithBuildTimeStars(projects) {
  return Promise.all(
    projects.map(async (project) => {
      if (typeof project.githubStars === "number" || typeof project.github !== "string") {
        return project;
      }
      const repo = parseGitHubRepo(project.github);
      if (!repo) return project;
      const stars = await fetchStarCount(repo);
      return stars !== undefined ? { ...project, githubStars: stars } : project;
    }),
  );
}

const snapshot = {
  posts: collectPosts(),
  projects: collectProjects(),
  projectReadmes: collectProjectReadmes(),
  books: collectBooks(),
  authors: collectAuthors(),
  siteConfig: collectSiteConfig(),
  nuggets: collectNuggets(),
};

snapshot.projects = await enrichProjectsWithBuildTimeStars(snapshot.projects);

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, `${JSON.stringify(snapshot)}\n`);
const bytes = statSync(outFile).size;
const withStars = snapshot.projects.filter((project) => typeof project.githubStars === "number").length;
console.log(
  `Wrote content snapshot: ${snapshot.posts.length} posts, ${snapshot.projects.length} projects (${withStars} with GitHub stars), ${snapshot.books.length} books, ${snapshot.nuggets.length} nuggets, ${Object.keys(snapshot.authors).length} authors (${(bytes / 1024).toFixed(1)} KB)`,
);
