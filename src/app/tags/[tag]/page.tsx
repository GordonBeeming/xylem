import { notFound } from "next/navigation";
import { getPublishedPosts } from "@/lib/tina-helpers";
import { getTagCounts, getTagDisplayNames } from "@/lib/content";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { slug } from "github-slugger";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const published = getPublishedPosts();
  const tagCounts = getTagCounts(published);
  return Object.keys(tagCounts).map((tag) => ({ tag }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { tag } = await props.params;
  const decodedTag = decodeURIComponent(tag);
  const published = getPublishedPosts();
  const displayNames = getTagDisplayNames(published);
  const displayName = displayNames[decodedTag] ?? decodedTag;
  return {
    title: `Posts tagged: ${displayName}`,
    description: `Browse all blog posts tagged with "${displayName}" by Gordon Beeming.`,
  };
}

export default async function TagFilteredPage(props: PageProps) {
  const { tag } = await props.params;
  const decodedTag = decodeURIComponent(tag);

  const published = getPublishedPosts();
  const displayNames = getTagDisplayNames(published);
  const displayName = displayNames[decodedTag] ?? decodedTag;
  const filtered = published.filter((post) =>
    post.tags.some((t) => slug(t).replace(/--+/g, "-") === decodedTag)
  );

  if (filtered.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Posts tagged: {displayName}
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)]">
          {filtered.length} post{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <section aria-label="Blog posts">
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((post) => (
            <BlogPostCard
              key={post.slug}
              post={{
                title: post.title,
                date: post.date,
                summary: post.summary ?? "",
                tags: post.tags,
                slug: post.slug,
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
