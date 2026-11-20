import type { PostMeta } from "./tina-helpers";
import readingTime from "reading-time";

export type TinaPostNode = {
  title?: string | null;
  date?: string | null;
  lastmod?: string | null;
  summary?: string | null;
  canonicalUrl?: string | null;
  tags?: (string | null)[] | null;
  _sys?: { relativePath?: string | null };
};

export function mergeFilesystemAndTinaPosts(
  filesystem: PostMeta[],
  tinaPosts: PostMeta[],
): PostMeta[] {
  const bySlug = new Map<string, PostMeta>();
  for (const post of filesystem) bySlug.set(post.slug, post);
  for (const post of tinaPosts) bySlug.set(post.slug, post);
  return [...bySlug.values()].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function postMetaFromTinaConnectionNode(node: TinaPostNode): PostMeta | null {
  const relativePath = node._sys?.relativePath?.trim();
  if (!relativePath || !node.title || !node.date) return null;
  const slug = relativePath.replace(/\.mdx?$/, "");
  const summary = node.summary ?? "";
  const reading = readingTime(summary || node.title);
  return {
    title: node.title,
    date: node.date,
    tags: (node.tags ?? []).filter((tag): tag is string => Boolean(tag)),
    lastmod: node.lastmod || undefined,
    summary: node.summary || undefined,
    canonicalUrl: node.canonicalUrl || undefined,
    slug,
    readingTime: { text: reading.text, minutes: Math.ceil(reading.minutes) },
  };
}
