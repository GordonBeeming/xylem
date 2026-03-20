import { getPublishedPosts } from "@/lib/tina-helpers";
import { getTagCounts, getYearCounts } from "@/lib/content";
import BlogListClient from "./BlogListClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Posts",
  description:
    "Browse all blog posts by Gordon Beeming about development, DevOps, Azure, and modern web technologies.",
};

export default function BlogPage() {
  const published = getPublishedPosts();

  const postsData = published.map((p) => ({
    title: p.title,
    date: p.date,
    summary: p.summary ?? "",
    tags: p.tags,
    slug: p.slug,
    readingTime: p.readingTime,
  }));

  const tagCounts = getTagCounts(published);
  const yearCounts = getYearCounts(published);

  return <BlogListClient allPosts={postsData} tagCounts={tagCounts} yearCounts={yearCounts} />;
}
