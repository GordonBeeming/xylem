/** Resolve a blog slug from a Tina preview URL or a 404'd /blog/... path. */

export function blogSlugFromPathname(pathname: string): string | null {
  const clean = pathname.replace(/\.html$/, "").replace(/\/+$/, "");
  const match = clean.match(/^\/blog\/(.+)$/);
  if (!match) return null;
  const slug = match[1];
  if (!slug || slug.startsWith("tags/")) return null;
  return slug;
}

export function blogSlugFromSearchParam(path: string | null | undefined): string | null {
  if (!path) return null;
  const slug = path.trim().replace(/^\/+/, "").replace(/\.mdx?$/, "");
  return slug.length > 0 ? slug : null;
}

export function postRelativePath(slug: string): string {
  return `${slug.replace(/\/+$/, "")}.mdx`;
}
