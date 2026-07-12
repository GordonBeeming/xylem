import type { PostMeta, ProjectData, BookData } from "@/lib/tina-helpers";
import type { NuggetMeta } from "@/lib/nuggets";
import { sortPosts, formatDateShort } from "@/lib/content";

export type FeedItemType = "post" | "nugget" | "project" | "book";

export interface FeedItem {
  type: FeedItemType;
  key: string;
  title: string;
  date: string;
  /** Human-readable date. ISO dates are formatted "Jun 18, 2026"; a book's
   *  free-text publishedDate ("October 2015") passes through unformatted. */
  dateDisplay: string;
  year: number;
  href: string;
  external?: boolean;
  summary?: string;
  tags?: string[];
  readingTime?: string;
  stars?: number;
  status?: string;
}

interface YearGroup {
  year: number;
  items: FeedItem[];
}

/** Normalizes posts, nuggets, projects, and books into one reverse-chronological feed. */
export function buildHomeFeed(
  posts: PostMeta[],
  nuggets: NuggetMeta[],
  projects: ProjectData[],
  books: BookData[]
): FeedItem[] {
  const postItems: FeedItem[] = posts.map((p) => ({
    type: "post",
    key: `post-${p.slug}`,
    title: p.title,
    date: p.date,
    dateDisplay: formatDateShort(p.date),
    year: new Date(p.date).getFullYear(),
    href: `/blog/${p.slug}`,
    summary: p.summary,
    tags: p.tags,
    readingTime: p.readingTime.text,
  }));

  const nuggetItems: FeedItem[] = nuggets.map((n) => ({
    type: "nugget",
    key: `nugget-${n.slug}`,
    title: n.title,
    date: n.date,
    dateDisplay: formatDateShort(n.date),
    year: new Date(n.date).getFullYear(),
    href: `/nuggets/${n.slug}`,
    summary: n.summary,
    tags: n.tags,
  }));

  // Projects without a `date` have no chronological home and are excluded from
  // the timeline (they still appear in the ⌘K palette and /projects).
  const projectItems: FeedItem[] = projects
    .filter((p): p is ProjectData & { date: string } => Boolean(p.date))
    .map((p) => ({
      type: "project",
      key: `project-${p.slug}`,
      title: p.title,
      date: p.date,
      dateDisplay: formatDateShort(p.date),
      year: new Date(p.date).getFullYear(),
      href: `/projects/${p.slug}`,
      external: false,
      summary: p.description,
      tags: p.techStack,
      stars: p.githubStars,
      status: p.status,
    }));

  const bookItems: FeedItem[] = books
    .filter((b): b is BookData & { publishedDate: string } => Boolean(b.publishedDate))
    .map((b) => ({
      type: "book",
      key: `book-${b.slug}`,
      title: b.title,
      date: b.publishedDate,
      dateDisplay: b.publishedDate,
      year: new Date(b.publishedDate).getFullYear(),
      href: `/books/${b.slug}`,
      summary: b.description,
    }));

  return sortPosts([...postItems, ...nuggetItems, ...projectItems, ...bookItems]);
}

export function groupFeedByYear(items: FeedItem[]): YearGroup[] {
  const map = new Map<number, FeedItem[]>();
  for (const item of items) {
    if (!map.has(item.year)) map.set(item.year, []);
    map.get(item.year)!.push(item);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, groupItems]) => ({ year, items: groupItems }));
}
