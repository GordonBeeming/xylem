import { getAllPosts } from "@/lib/tina-helpers";
import { getAllNuggets } from "@/lib/nuggets";

export const dynamic = "force-static";

export interface SearchItem {
  type: "post" | "nugget";
  title: string;
  slug: string;
  summary?: string;
  tags: string[];
  date: string;
}

export function GET() {
  const posts: SearchItem[] = getAllPosts().map((p) => ({
    type: "post",
    title: p.title,
    slug: p.slug,
    summary: p.summary,
    tags: p.tags,
    date: p.date,
  }));

  const nuggets: SearchItem[] = getAllNuggets().map((n) => ({
    type: "nugget",
    title: n.title,
    slug: n.slug,
    summary: n.summary,
    tags: n.tags,
    date: n.date,
  }));

  const all = [...posts, ...nuggets].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return Response.json(all);
}
