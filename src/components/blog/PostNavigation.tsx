import Link from "next/link";

interface NavPost {
  title: string;
  slug: string;
}

interface PostNavigationProps {
  prevPost?: NavPost | null;
  nextPost?: NavPost | null;
}

const mono = { fontFamily: "var(--font-mono)" };
const eyebrow = { ...mono, fontSize: "var(--text-2xs)", letterSpacing: "var(--ls-wide)", textTransform: "uppercase" as const, color: "var(--text-subtle)" };

export function PostNavigation({ prevPost, nextPost }: PostNavigationProps) {
  if (!prevPost && !nextPost) return null;

  return (
    <nav className="prevnext">
      {prevPost ? (
        <Link href={`/blog/${prevPost.slug}`} className="pn-card">
          <span style={eyebrow}>← Previous</span>
          <span className="mt-1.5" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-medium)", color: "var(--text)" }}>
            {prevPost.title}
          </span>
        </Link>
      ) : (
        <span />
      )}

      {nextPost ? (
        <Link href={`/blog/${nextPost.slug}`} className="pn-card text-right">
          <span style={eyebrow}>Next →</span>
          <span className="mt-1.5" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--fw-medium)", color: "var(--text)" }}>
            {nextPost.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
