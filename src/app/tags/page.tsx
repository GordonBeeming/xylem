import { getAllPosts } from "@/lib/tina-helpers";
import { getTagCounts, getTagDisplayNames } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all tags used across blog posts by Gordon Beeming.",
};

const mono = { fontFamily: "var(--font-mono)" };

export default function TagsPage() {
  const published = getAllPosts();
  const tagCounts = getTagCounts(published);
  const tagDisplayNames = getTagDisplayNames(published);

  const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a);
  const max = sortedTags.length > 0 ? sortedTags[0][1] : 1;

  return (
    <div className="page-narrow">
      <div className="eyebrow">Tags</div>
      <h1
        className="mt-3"
        style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", color: "var(--text)" }}
      >
        Browse by topic
      </h1>
      <p
        className="mt-2.5"
        style={{ fontSize: "var(--text-md)", color: "var(--text-muted)", lineHeight: "var(--lh-relaxed)" }}
      >
        {sortedTags.length} tags across {published.length} posts. Bigger means more posts —
        each tag has its own page and RSS feed.
      </p>

      <div className="mt-[var(--space-10)] flex flex-wrap items-baseline gap-[var(--space-3)]">
        {sortedTags.map(([tag, count]) => {
          const scale = 0.82 + (count / max) * 0.9;
          return (
            <a
              key={tag}
              href={`/tags/${tag}`}
              className="inline-flex items-baseline gap-[7px] rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-[13px] py-[6px] text-[color:var(--text-muted)] no-underline transition-[var(--transition-colors)] hover:border-[var(--accent)] hover:text-[color:var(--accent)]"
              style={{ ...mono, fontSize: `calc(var(--text-sm) * ${scale.toFixed(2)})` }}
            >
              {(tagDisplayNames[tag] ?? tag).toLowerCase()}
              <span className="text-[length:var(--text-2xs)] text-[color:var(--text-subtle)]">{count}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
