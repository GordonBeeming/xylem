import { Card } from "@/components/ds/Card";
import { formatDateShort } from "@/lib/content";

interface RelatedPost {
  title: string;
  slug: string;
  date: string;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
}

const mono = { fontFamily: "var(--font-mono)" };

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-[var(--space-12)]">
      <div className="eyebrow mb-[var(--space-5)]">Related posts</div>
      <div className="related-grid">
        {posts.map((post) => (
          <Card key={post.slug} interactive href={`/blog/${post.slug}`}>
            <div style={{ ...mono, fontSize: "var(--text-2xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase", color: "var(--text-subtle)" }}>
              {formatDateShort(post.date)}
            </div>
            <h3
              className="mt-2"
              style={{ margin: "8px 0 0", fontSize: "var(--text-base)", fontWeight: "var(--fw-semibold)", lineHeight: "var(--lh-snug)", letterSpacing: "var(--ls-tight)", color: "var(--text)" }}
            >
              {post.title}
            </h3>
          </Card>
        ))}
      </div>
    </section>
  );
}
