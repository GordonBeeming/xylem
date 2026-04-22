import readingTime from 'reading-time';
import { slug } from 'github-slugger';

export function computeReadingTime(text: string) {
  return readingTime(text);
}

export function computeSlug(relativePath: string): string {
  // Remove .mdx extension and content/blog/ prefix
  return relativePath
    .replace(/\.mdx?$/, '')
    .replace(/^content\/blog\//, '');
}

export function formatDate(date: string, locale: string = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function sortPosts<T extends { date: string }>(posts: T[]): T[] {
  return [...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
