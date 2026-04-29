import Link from "next/link";
import { TagPill } from "@/components/ui/TagPill";

interface BlogPostCardProps {
  post: {
    title: string;
    date: string;
    summary: string;
    tags: string[];
    slug: string;
  };
  headingLevel?: 2 | 3;
}

export function BlogPostCard({ post, headingLevel = 3 }: BlogPostCardProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const displayTags = post.tags.slice(0, 3);
  const remainingCount = post.tags.length - 3;

  return (
    <article>
      <Link
        href={`/blog/${post.slug}`}
        className="block rounded-xl border-l-2 border-l-transparent bg-[var(--color-surface-secondary)] p-6 shadow-[var(--shadow-card)] transition-all duration-200 ease-[var(--ease-default)] hover:-translate-y-0.5 hover:border-l-[var(--color-brand-primary)] hover:shadow-[var(--shadow-card-hover)]"
      >
        <time
          dateTime={post.date}
          className="mb-2 block font-[var(--font-mono)] text-[13px] uppercase tracking-wide text-[var(--color-text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {formattedDate}
        </time>
        <Heading className="mb-2 line-clamp-2 text-xl font-bold leading-snug text-[var(--color-text-primary)]">
          {post.title}
        </Heading>
        <p className="mb-3.5 line-clamp-3 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
          {post.summary}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {displayTags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--color-brand-primary)]"
            >
              {tag}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="inline-block rounded-full bg-[var(--color-surface-tertiary)] px-3 py-1 text-xs font-medium text-[var(--color-text-tertiary)]">
              +{remainingCount} more
            </span>
          )}
        </div>
      </Link>
    </article>
  );
}
