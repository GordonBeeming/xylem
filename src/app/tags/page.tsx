import { getPublishedPosts } from "@/lib/tina-helpers";
import { getTagCounts } from "@/lib/content";
import { TagPill } from "@/components/ui/TagPill";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all tags used across blog posts by Gordon Beeming.",
};

export default function TagsPage() {
  const published = getPublishedPosts();
  const tagCounts = getTagCounts(published);

  const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a);
  const totalTags = sortedTags.length;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Tags
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)]">
          {totalTags} tags across all posts
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {sortedTags.map(([tag, count]) => (
          <TagPill key={tag} tag={tag} count={count} />
        ))}
      </div>
    </div>
  );
}
