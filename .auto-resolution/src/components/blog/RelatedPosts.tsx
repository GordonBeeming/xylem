import Link from "next/link";

interface RelatedPost {
  title: string;
  slug: string;
  date: string;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-3xl border-t border-[var(--color-border-default)] px-6 py-12">
      <h2 className="mb-6 text-2xl font-extrabold text-[var(--color-text-primary)]">
        Related Posts
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {posts.map((post) => {
          const formattedDate = new Date(post.date).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          );

          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-brand-accent)] hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="mb-2 text-[15px] font-medium leading-snug text-[var(--color-text-primary)]">
                {post.title}
              </div>
              <div className="text-[13px] text-[var(--color-text-secondary)]">
                {formattedDate}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
