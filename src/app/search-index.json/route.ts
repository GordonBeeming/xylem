import { getAllPosts, getAllProjects, getAllBooks } from "@/lib/tina-helpers";
import { getAllNuggets } from "@/lib/nuggets";
import { sortPosts } from "@/lib/content";

export const dynamic = "force-static";

export interface SearchItem {
  type: "post" | "nugget" | "project" | "book";
  title: string;
  href: string;
  external?: boolean;
  summary?: string;
  tags: string[];
  date: string;
}

export function GET() {
  const posts: SearchItem[] = getAllPosts().map((p) => ({
    type: "post",
    title: p.title,
    href: `/blog/${p.slug}`,
    summary: p.summary,
    tags: p.tags,
    date: p.date,
  }));

  const nuggets: SearchItem[] = getAllNuggets().map((n) => ({
    type: "nugget",
    title: n.title,
    href: `/nuggets/${n.slug}`,
    summary: n.summary,
    tags: n.tags,
    date: n.date,
  }));

  const projects: SearchItem[] = getAllProjects().map((p) => ({
    type: "project",
    title: p.title,
    href: p.href ?? p.github ?? "/projects",
    external: Boolean(p.href ?? p.github),
    summary: p.description,
    tags: p.techStack ?? [],
    date: p.date ?? "1970-01-01",
  }));

  const books: SearchItem[] = getAllBooks().map((b) => ({
    type: "book",
    title: b.title,
    href: `/books/${b.slug}`,
    summary: b.description,
    tags: [],
    date: b.publishedDate ?? "1970-01-01",
  }));

  const all = sortPosts([...posts, ...nuggets, ...projects, ...books]);

  return Response.json(all);
}
