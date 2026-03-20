import { notFound } from "next/navigation";
import { getPublishedPosts } from "@/lib/tina-helpers";
import { getYearCounts } from "@/lib/content";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ year: string }>;
}

export async function generateStaticParams() {
  const published = getPublishedPosts();
  const yearCounts = getYearCounts(published);
  return Object.keys(yearCounts).map((year) => ({ year }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { year } = await props.params;
  return {
    title: `Posts from ${year}`,
    description: `Browse all blog posts from ${year} by Gordon Beeming.`,
  };
}

export default async function YearFilteredPage(props: PageProps) {
  const { year } = await props.params;

  const published = getPublishedPosts();
  const filtered = published.filter((post) => post.date.startsWith(year));

  if (filtered.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Posts from {year}
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
