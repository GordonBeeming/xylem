import { getAllPosts } from "@/lib/tina-helpers";
import { getYearCounts } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Years",
  description: "Browse blog posts by year.",
};

export default function YearsPage() {
  const published = getAllPosts();
  const yearCounts = getYearCounts(published);

  const sortedYears = Object.entries(yearCounts).sort(([a], [b]) => Number(b) - Number(a));
  const max = sortedYears.length > 0 ? Math.max(...sortedYears.map(([, n]) => n)) : 1;

  return (
    <div className="page-narrow">
      <div className="eyebrow">Archive</div>
      <h1
        className="mt-3"
        style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", color: "var(--text)" }}
      >
        By year
      </h1>
      <p
        className="mt-2.5"
        style={{ fontSize: "var(--text-md)", color: "var(--text-muted)", lineHeight: "var(--lh-relaxed)" }}
      >
        {sortedYears.length} years of writing. Each year has its own page and RSS feed.
      </p>

      <div className="mt-[var(--space-10)] flex flex-col">
        {sortedYears.map(([year, count]) => (
          <a
            key={year}
            href={`/years/${year}`}
            className="year-row grid items-center gap-[var(--space-5)] border-b border-[var(--border)] py-[var(--space-4)] no-underline"
            style={{ gridTemplateColumns: "92px 1fr auto" }}
          >
            <span
              className="tabular-nums"
              style={{ fontSize: "var(--text-lg)", fontWeight: "var(--fw-bold)", color: "var(--text)", letterSpacing: "var(--ls-tight)" }}
            >
              {year}
            </span>
            <span className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
              <span
                className="block h-full rounded-full"
                style={{ width: `${(count / max) * 100}%`, background: "var(--accent)" }}
              />
            </span>
            <span
              className="whitespace-nowrap"
              style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--text-subtle)" }}
            >
              {count} post{count !== 1 ? "s" : ""}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
