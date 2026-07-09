import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts } from "@/lib/tina-helpers";
import { getYearCounts, formatDateShort } from "@/lib/content";
import { PostListItem } from "@/components/ds/PostListItem";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ year: string }>;
}

export async function generateStaticParams() {
  const published = getAllPosts();
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

  const published = getAllPosts();
  const filtered = published.filter((post) => post.date.startsWith(year));

  if (filtered.length === 0) {
    notFound();
  }

  return (
    <div className="page-narrow">
      <Link
        href="/years"
        className="no-underline"
        style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-muted)" }}
      >
        ← all years
      </Link>
      <div className="mt-[18px] flex flex-wrap items-center gap-[var(--space-4)]">
        <h1
          className="tabular-nums"
          style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", color: "var(--text)" }}
        >
          Posts from {year}
        </h1>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-subtle)" }}>
          {filtered.length} post{filtered.length !== 1 ? "s" : ""}
        </span>
        <a
          href={`/years/${year}/feed.xml`}
          className="no-underline"
          style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-xs)", padding: "3px 9px" }}
        >
          RSS ↗
        </a>
      </div>
      <div className="mt-[var(--space-8)]">
        {filtered.map((post) => (
          <PostListItem
            key={post.slug}
            href={`/blog/${post.slug}`}
            date={formatDateShort(post.date)}
            readingTime={post.readingTime.text}
            title={post.title}
            summary={post.summary ?? ""}
            tags={post.tags.slice(0, 3)}
            extraTags={Math.max(0, post.tags.length - 3)}
          />
        ))}
      </div>
    </div>
  );
}
