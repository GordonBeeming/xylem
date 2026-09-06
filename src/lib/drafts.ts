import fs from "fs";
import os from "os";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

const DRAFTS_DIR = path.join(process.cwd(), "content", "blog-drafts");

/** Where the blog automation keeps its queue. It lives outside the repo on
 *  purpose, so it is only readable on Gordon's machine and is simply absent in
 *  CI. */
const QUEUE_FILE = path.join(
  os.homedir(),
  "Library",
  "Application Support",
  "Xylem Blog Automation",
  "queue.yaml"
);

export interface DraftMeta {
  slug: string;
  title: string;
  date: string | null;
  tags: string[];
  summary: string | null;
  words: number;
  images: number;
  /** 1-based place in the publish queue, or null when the queue does not list it. */
  queuePosition: number | null;
}

export interface DraftBody {
  meta: DraftMeta;
  content: string;
}

export interface QueueInfo {
  nextPublishOn: string | null;
  publishEveryDays: number | null;
  /** Queue entries whose file is not on disk. A stale queue is a real problem,
   *  so it is surfaced rather than quietly skipped. */
  missing: string[];
}

function readFrontmatter(file: string) {
  try {
    return matter(fs.readFileSync(file, "utf8"));
  } catch (error) {
    console.error(`Failed to read draft ${file}:`, error);
    return null;
  }
}

function readQueuePaths(): { paths: string[]; info: QueueInfo } {
  const empty = { paths: [], info: { nextPublishOn: null, publishEveryDays: null, missing: [] } };
  if (!fs.existsSync(QUEUE_FILE)) return empty;
  try {
    const parsed = yaml.load(fs.readFileSync(QUEUE_FILE, "utf8"));
    if (parsed === null || typeof parsed !== "object") return empty;
    const q = parsed as Record<string, unknown>;
    const posts = Array.isArray(q.posts) ? q.posts.filter((p): p is string => typeof p === "string") : [];
    return {
      paths: posts,
      info: {
        nextPublishOn: typeof q.nextPublishOn === "string" ? q.nextPublishOn : null,
        publishEveryDays: typeof q.publishEveryDays === "number" ? q.publishEveryDays : null,
        missing: [],
      },
    };
  } catch (error) {
    console.error("Failed to read the publish queue:", error);
    return empty;
  }
}

function slugFromQueuePath(p: string): string {
  // "content/blog-drafts/<slug>/post.mdx"
  const parts = p.split("/");
  const i = parts.indexOf("blog-drafts");
  return i >= 0 && parts[i + 1] ? parts[i + 1] : p;
}

/** Every draft bundle on disk, ordered by queue position first and then by
 *  title, so what is actually next to go out sits at the top. */
export function getDrafts(): { drafts: DraftMeta[]; queue: QueueInfo } {
  const { paths, info } = readQueuePaths();
  const queueSlugs = paths.map(slugFromQueuePath);

  if (!fs.existsSync(DRAFTS_DIR)) {
    return { drafts: [], queue: { ...info, missing: queueSlugs } };
  }

  const drafts: DraftMeta[] = [];
  for (const entry of fs.readdirSync(DRAFTS_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(DRAFTS_DIR, entry.name, "post.mdx");
    if (!fs.existsSync(file)) continue;
    const parsed = readFrontmatter(file);
    if (parsed === null) continue;

    const data = parsed.data as Record<string, unknown>;
    const imagesDir = path.join(DRAFTS_DIR, entry.name, "images");
    const images = fs.existsSync(imagesDir) ? fs.readdirSync(imagesDir).length : 0;
    const queueIndex = queueSlugs.indexOf(entry.name);

    drafts.push({
      slug: entry.name,
      title: typeof data.title === "string" ? data.title : entry.name,
      date: typeof data.date === "string" ? data.date : data.date instanceof Date ? data.date.toISOString().slice(0, 10) : null,
      tags: Array.isArray(data.tags) ? data.tags.filter((t): t is string => typeof t === "string") : [],
      summary: typeof data.summary === "string" ? data.summary : null,
      words: parsed.content.trim().split(/\s+/).filter(Boolean).length,
      images,
      queuePosition: queueIndex >= 0 ? queueIndex + 1 : null,
    });
  }

  drafts.sort((a, b) => {
    if (a.queuePosition !== null && b.queuePosition !== null) return a.queuePosition - b.queuePosition;
    if (a.queuePosition !== null) return -1;
    if (b.queuePosition !== null) return 1;
    return a.title.localeCompare(b.title);
  });

  const onDisk = new Set(drafts.map((d) => d.slug));
  return { drafts, queue: { ...info, missing: queueSlugs.filter((s) => !onDisk.has(s)) } };
}

/** One draft with its body, for the local preview. Returns null when the slug
 *  does not name a bundle on disk. */
export function getDraft(slug: string): DraftBody | null {
  const found = getDrafts().drafts.find((d) => d.slug === slug);
  if (found === undefined) return null;
  const parsed = readFrontmatter(path.join(DRAFTS_DIR, slug, "post.mdx"));
  if (parsed === null) return null;
  return { meta: found, content: parsed.content };
}

/** Slugs only, for generateStaticParams. */
export function getDraftSlugs(): string[] {
  return getDrafts().drafts.map((d) => d.slug);
}
