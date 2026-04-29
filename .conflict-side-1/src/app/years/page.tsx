import { getAllPosts } from "@/lib/tina-helpers";
import { getYearCounts } from "@/lib/content";
import { YearPill } from "@/components/ui/YearPill";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Years",
  description: "Browse blog posts by year.",
};

export default function YearsPage() {
  const published = getAllPosts();
  const yearCounts = getYearCounts(published);

  const sortedYears = Object.entries(yearCounts).sort(
    ([a], [b]) => Number(b) - Number(a)
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Years
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)]">
          Posts spanning {sortedYears.length} years
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {sortedYears.map(([year, count]) => (
          <YearPill key={year} year={year} count={count} />
        ))}
      </div>
    </div>
  );
}
