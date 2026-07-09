import readingTime from 'reading-time';
import GithubSlugger, { slug } from 'github-slugger';

export function computeReadingTime(text: string) {
  return readingTime(text);
}

export function computeSlug(relativePath: string): string {
  // Remove .mdx extension and content/blog/ prefix
  return relativePath
    .replace(/\.mdx?$/, '')
    .replace(/^content\/blog\//, '');
}

/** Builds a safe `/blog/<slug>` href, percent-encoding each path segment
 *  individually so the real `/`-separated route structure survives. */
export function postHref(slug: string): string {
  return `/blog/${slug.split('/').map(encodeURIComponent).join('/')}`;
}

export function formatDate(date: string, locale: string = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/** Compact "Jun 18, 2026" form for mono metadata (e.g. the home timeline). */
export function formatDateShort(date: string, locale: string = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(date));
}

export function sortPosts<T extends { date: string }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const timeA = Date.parse(a.date);
    const timeB = Date.parse(b.date);
    return (Number.isNaN(timeB) ? 0 : timeB) - (Number.isNaN(timeA) ? 0 : timeA);
  });
}

export function getTagCounts(posts: { tags?: string[] | null }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const post of posts) {
    if (post.tags) {
      for (const tag of post.tags) {
        const s = slug(tag).replace(/--+/g, '-');
        counts[s] = (counts[s] || 0) + 1;
      }
    }
  }
  return counts;
}

export function getTagDisplayNames(posts: { tags?: string[] | null }[]): Record<string, string> {
  const names: Record<string, string> = {};
  for (const post of posts) {
    if (post.tags) {
      for (const tag of post.tags) {
        const s = slug(tag).replace(/--+/g, '-');
        if (!names[s]) {
          names[s] = tag;
        }
      }
    }
  }
  return names;
}

export function getYearCounts(posts: { date: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const post of posts) {
    const year = new Date(post.date).getFullYear().toString();
    if (year !== '1970') {
      counts[year] = (counts[year] || 0) + 1;
    }
  }
  return counts;
}

export interface HeadingEntry {
  id: string;
  text: string;
}

/**
 * Extracts `## ` (h2) headings from raw MDX for the reading TOC. Strips basic
 * inline markdown/JSX so link/emphasis syntax doesn't leak into the label, then
 * slugs each heading with the same algorithm rehype-slug uses at render time
 * (github-slugger, run through a single stateful Slugger instance in document
 * order) so the generated ids match the real heading anchors exactly.
 */
export function extractHeadings(markdown: string): HeadingEntry[] {
  const slugger = new GithubSlugger();
  const headings: HeadingEntry[] = [];
  const lines = markdown.split('\n');
  let inCodeFence = false;

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    const match = line.match(/^##\s+(.+?)\s*$/);
    if (!match) continue;

    const text = match[1]
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (text) {
      headings.push({ id: slugger.slug(text), text });
    }
  }

  return headings;
}
