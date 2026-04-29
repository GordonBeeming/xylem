import Link from "next/link";

interface NavPost {
  title: string;
  slug: string;
}

interface PostNavigationProps {
  prevPost?: NavPost;
  nextPost?: NavPost;
}

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  if (!prevPost && !nextPost) return null;

  return (
    <nav className="mx-auto grid max-w-3xl grid-cols-1 gap-4 px-6 py-8 sm:grid-cols-2">
      {prevPost ? (
        <Link
          href={`/blog/${prevPost.slug}`}
          className="block rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-brand-accent)] hover:shadow-[var(--shadow-card-hover)]"
        >
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
            &larr; Previous
          </div>
          <div className="text-[15px] font-medium leading-snug text-[var(--color-brand-primary)]">
            {prevPost.title}
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextPost ? (
        <Link
          href={`/blog/${nextPost.slug}`}
          className="block rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)] p-5 text-right transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-brand-accent)] hover:shadow-[var(--shadow-card-hover)]"
        >
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
            Next &rarr;
          </div>
          <div className="text-[15px] font-medium leading-snug text-[var(--color-brand-primary)]">
            {nextPost.title}
          </div>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
