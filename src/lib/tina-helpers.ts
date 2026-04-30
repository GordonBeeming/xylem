import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface PostMeta {
  title: string;
  date: string;
  tags: string[];
  lastmod?: string;
  summary?: string;
  canonicalUrl?: string;
  slug: string;
  readingTime: { text: string; minutes: number };
}

/** Alias for backwards compatibility with feed-helpers */
export type PostData = PostMeta;

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function walkDir(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) {
    return results;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function parsePostFile(filePath: string): PostMeta | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    if (!data.title || !data.date) {
      return null;
    }

    const relativePath = path.relative(BLOG_DIR, filePath);
    const slug = relativePath.replace(/\.mdx?$/, "");

    const rt = readingTime(content);

    return {
      title: data.title,
      date:
        data.date instanceof Date
          ? data.date.toISOString()
          : String(data.date),
      tags: Array.isArray(data.tags) ? data.tags : [],
      lastmod: data.lastmod
        ? data.lastmod instanceof Date
          ? data.lastmod.toISOString()
          : String(data.lastmod)
        : undefined,
      summary: data.summary ?? undefined,
      canonicalUrl: typeof data.canonicalUrl === "string" ? data.canonicalUrl : undefined,
      slug,
      readingTime: { text: rt.text, minutes: Math.ceil(rt.minutes) },
    };
  } catch (error) {
    console.error(`Error parsing post file ${filePath}:`, error);
    return null;
  }
}

let cachedAllPosts: PostMeta[] | null = null;

export function getAllPosts(): PostMeta[] {
  if (cachedAllPosts !== null) {
    return cachedAllPosts;
  }

  const files = walkDir(BLOG_DIR);
  const posts: PostMeta[] = [];

  for (const file of files) {
    const post = parsePostFile(file);
    if (post !== null) {
      posts.push(post);
    }
  }

  posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  cachedAllPosts = posts;
  return posts;
}

export function getPost(
  slugParts: string[]
): { meta: PostMeta; content: string } | null {
  const slug = slugParts.join("/");
  const filePath = path.join(BLOG_DIR, slug + ".mdx");

  if (!fs.existsSync(filePath)) {
    const mdPath = path.join(BLOG_DIR, slug + ".md");
    if (!fs.existsSync(mdPath)) {
      return null;
    }
    return readPostFile(mdPath, slug);
  }

  return readPostFile(filePath, slug);
}

function readPostFile(
  filePath: string,
  slug: string
): { meta: PostMeta; content: string } | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    if (!data.title || !data.date) {
      return null;
    }

    const rt = readingTime(content);

    const meta: PostMeta = {
      title: data.title,
      date:
        data.date instanceof Date
          ? data.date.toISOString()
          : String(data.date),
      tags: Array.isArray(data.tags) ? data.tags : [],
      lastmod: data.lastmod
        ? data.lastmod instanceof Date
          ? data.lastmod.toISOString()
          : String(data.lastmod)
        : undefined,
      summary: data.summary ?? undefined,
      canonicalUrl: typeof data.canonicalUrl === "string" ? data.canonicalUrl : undefined,
      slug,
      readingTime: { text: rt.text, minutes: Math.ceil(rt.minutes) },
    };

    return { meta, content };
  } catch (error) {
    console.error(`Error reading post file ${filePath}:`, error);
    return null;
  }
}

export function getRelatedPosts(
  currentSlug: string,
  tags: string[],
  count: number = 3
): PostMeta[] {
  const published = getAllPosts();

  if (tags.length === 0) {
    return published.filter((p) => p.slug !== currentSlug).slice(0, count);
  }

  const scored = published
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      const sharedTags = p.tags.filter((t) => tags.includes(t)).length;
      return { post: p, score: sharedTags };
    })
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.post.date).getTime() - new Date(a.post.date).getTime()
    );

  return scored.slice(0, count).map((item) => item.post);
}

export function getAdjacentPosts(
  currentSlug: string
): { prev: PostMeta | null; next: PostMeta | null } {
  const published = getAllPosts();
  const index = published.findIndex((p) => p.slug === currentSlug);

  if (index === -1) {
    return { prev: null, next: null };
  }

  const next = index > 0 ? published[index - 1] : null;
  const prev = index < published.length - 1 ? published[index + 1] : null;

  return { prev, next };
}

// ─── Project helpers ─────────────────────────────────────────────────────────

export interface ProjectData {
  title: string;
  description: string;
  href?: string;
  imgSrc?: string;
  techStack?: string[];
  github?: string;
  video?: string;
  featured?: boolean;
  githubStars?: number;
}

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

export function getAllProjects(): ProjectData[] {
  if (!fs.existsSync(PROJECTS_DIR)) {
    return [];
  }
  const files = fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".json"));
  const projects: ProjectData[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf-8");
      const data = JSON.parse(raw) as Record<string, unknown>;
      projects.push({
        title: (data.title as string) ?? "Untitled",
        description: (data.description as string) ?? "",
        href: (data.href as string) ?? undefined,
        imgSrc: (data.imgSrc as string) ?? undefined,
        techStack: Array.isArray(data.techStack)
          ? (data.techStack as string[])
          : [],
        github: (data.github as string) ?? undefined,
        video: (data.video as string) ?? undefined,
        featured: (data.featured as boolean) ?? false,
        githubStars: typeof data.githubStars === "number" ? data.githubStars : undefined,
      });
    } catch (error) {
      console.error(`Error reading project file ${file}:`, error);
    }
  }

  return projects;
}

// ─── Book helpers ────────────────────────────────────────────────────────────

export interface BookPerson {
  name: string;
  url?: string;
}

export interface BookChapter {
  title: string;
  sections: string[];
}

export interface BookData {
  slug: string;
  title: string;
  description: string;
  href?: string;
  imgSrc?: string;
  overview?: string;
  authors?: BookPerson[];
  reviewers?: BookPerson[];
  publisher?: string;
  publishedDate?: string;
  isbn?: string;
  tableOfContents?: BookChapter[];
}

const BOOKS_DIR = path.join(process.cwd(), "content", "books");

// Same shape as nugget/blog slugs — lowercase letters, digits, hyphens. Keeps
// filesystem-derived slugs out of URL/href attributes without a sanitizer
// step, which is what CodeQL's js/stored-xss rule complains about.
const VALID_BOOK_SLUG = /^[a-z0-9][a-z0-9-]*$/;

function isValidBookSlug(slug: string): boolean {
  return VALID_BOOK_SLUG.test(slug) && slug.length <= 100;
}

function parseBookFile(file: string): BookData | null {
  try {
    const slug = file.replace(/\.json$/, "");
    if (!isValidBookSlug(slug)) {
      console.warn(
        `Book ${file} skipped: slug must match /^[a-z0-9][a-z0-9-]*$/ (lowercase, digits, hyphens; max 100 chars).`
      );
      return null;
    }
    const raw = fs.readFileSync(path.join(BOOKS_DIR, file), "utf-8");
    const data = JSON.parse(raw) as Record<string, unknown>;
    return {
      slug,
      title: (data.title as string) ?? "Untitled",
      description: (data.description as string) ?? "",
      href: (data.href as string) ?? undefined,
      imgSrc: (data.imgSrc as string) ?? undefined,
      overview: (data.overview as string) ?? undefined,
      authors: (data.authors as BookPerson[]) ?? undefined,
      reviewers: (data.reviewers as BookPerson[]) ?? undefined,
      publisher: (data.publisher as string) ?? undefined,
      publishedDate: (data.publishedDate as string) ?? undefined,
      isbn: (data.isbn as string) ?? undefined,
      tableOfContents: (data.tableOfContents as BookChapter[]) ?? undefined,
    };
  } catch (error) {
    console.error(`Error reading book file ${file}:`, error);
    return null;
  }
}

export function getAllBooks(): BookData[] {
  if (!fs.existsSync(BOOKS_DIR)) {
    return [];
  }
  const files = fs.readdirSync(BOOKS_DIR).filter((f) => f.endsWith(".json"));
  const books: BookData[] = [];

  for (const file of files) {
    const book = parseBookFile(file);
    if (book) {
      books.push(book);
    }
  }

  return books;
}

export function getBook(slug: string): BookData | null {
  if (!isValidBookSlug(slug)) {
    return null;
  }
  const file = `${slug}.json`;
  const filePath = path.join(BOOKS_DIR, file);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return parseBookFile(file);
}

// ─── Site config helpers ─────────────────────────────────────────────────────

export interface SiteConfig {
  title: string;
  author: string;
  description: string;
  siteUrl: string;
  language: string;
  locale: string;
  timezone: string;
  email?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  bluesky?: string;
  instagram?: string;
  threads?: string;
  mastodon?: string;
  patreon?: string;
  buymeacoffee?: string;
  githubsponsors?: string;
}

const CONFIG_PATH = path.join(process.cwd(), "content", "config", "site.json");

export function getSiteConfig(): SiteConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(raw) as SiteConfig;
  } catch (error) {
    console.error("Error reading site config:", error);
    return {
      title: "xylem | Gordon Beeming",
      author: "Gordon Beeming",
      description: "Gordon Beeming - Developer Blog",
      siteUrl: "https://gordonbeeming.com",
      language: "en-us",
      locale: "en-US",
      timezone: "Australia/Brisbane",
    };
  }
}

// ─── Author helpers ──────────────────────────────────────────────────────────

export interface AuthorData {
  name: string;
  avatar?: string;
  profile_line_1?: string;
  profile_line_2?: string;
  company_name?: string;
  company_website?: string;
  company_logo_dark?: string;
  company_logo_light?: string;
  mvp_website?: string;
  mvp_logo_dark?: string;
  mvp_logo_light?: string;
  email?: string;
  twitter?: string;
  bluesky?: string;
  linkedin?: string;
  github?: string;
  layout?: string;
  body: string;
}

const AUTHORS_DIR = path.join(process.cwd(), "content", "authors");

export function getAuthor(name: string): AuthorData | null {
  const fileName = name.toLowerCase().replace(/\s+/g, "-") + ".mdx";
  const filePath = path.join(AUTHORS_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    return {
      name: (data.name as string) ?? name,
      avatar: data.avatar as string | undefined,
      profile_line_1: data.profile_line_1 as string | undefined,
      profile_line_2: data.profile_line_2 as string | undefined,
      company_name: data.company_name as string | undefined,
      company_website: data.company_website as string | undefined,
      company_logo_dark: data.company_logo_dark as string | undefined,
      company_logo_light: data.company_logo_light as string | undefined,
      mvp_website: data.mvp_website as string | undefined,
      mvp_logo_dark: data.mvp_logo_dark as string | undefined,
      mvp_logo_light: data.mvp_logo_light as string | undefined,
      email: data.email as string | undefined,
      twitter: data.twitter as string | undefined,
      bluesky: data.bluesky as string | undefined,
      linkedin: data.linkedin as string | undefined,
      github: data.github as string | undefined,
      layout: data.layout as string | undefined,
      body: content,
    };
  } catch (error) {
    console.error(`Error reading author file ${filePath}:`, error);
    return null;
  }
}
