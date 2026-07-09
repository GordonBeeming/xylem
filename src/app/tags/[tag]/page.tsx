import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts } from "@/lib/tina-helpers";
import { getTagCounts, getTagDisplayNames, formatDateShort } from "@/lib/content";
import { PostListItem } from "@/components/ds/PostListItem";
import { slug } from "github-slugger";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const published = getAllPosts();
  const tagCounts = getTagCounts(published);
  return Object.keys(tagCounts).map((tag) => ({ tag }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { tag } = await props.params;
  const decodedTag = decodeURIComponent(tag);
  const published = getAllPosts();
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

  const published = getAllPosts();
  const displayNames = getTagDisplayNames(published);
  const displayName = displayNames[decodedTag] ?? decodedTag;
  const filtered = published.filter((post) =>
    post.tags.some((t) => slug(t).replace(/--+/g, "-") === decodedTag)
  );

  if (filtered.length === 0) {
    notFound();
  }

  return (
    <div className="page-narrow">
      <Link
        href="/tags"
        className="no-underline"
        style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-muted)" }}
      >
        ← all tags
      </Link>
      <div className="mt-[18px] flex flex-wrap items-center gap-[var(--space-4)]">
        <h1
          style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", color: "var(--text)" }}
        >
          Tagged <span style={{ color: "var(--accent)" }}>{displayName}</span>
        </h1>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)", color: "var(--text-subtle)" }}>
          {filtered.length} post{filtered.length !== 1 ? "s" : ""}
        </span>
        <a
          href={`/tags/${decodedTag}/feed.xml`}
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
