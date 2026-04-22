import Link from "next/link";
import type { Metadata } from "next";
import { getAllNuggets } from "@/lib/nuggets";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { formatDate } from "@/lib/content";

export const metadata: Metadata = {
  title: "Nuggets",
  description:
    "Small, self-contained explainers by Gordon Beeming — mini knowledge drops on narrow technical topics.",
};

export default function NuggetsPage() {
  const nuggets = getAllNuggets();

  return (
    <SectionContainer variant="narrow" className="py-12">
      <header className="mb-10">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
          Nuggets
        </h1>
        <p className="text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
          Small, self-contained HTML pages I build with AI when I want to
          understand something specific, like a field guide to an API or a
          one-page walkthrough of an idea. The good ones end up here. Each
          nugget renders in its own iframe, so no two have to look alike and
          the site around it stays out of the way.
        </p>
      </header>

      {nuggets.length === 0 ? (
        <p className="text-[var(--color-text-tertiary)]">
          No nuggets yet — check back soon.
        </p>
      ) : (
        <ul className="space-y-4">
          {nuggets.map((n) => (
            <li key={n.slug}>
              <Link
                href={`/nuggets/${n.slug}`}
                className="block rounded-xl border-l-2 border-l-transparent bg-[var(--color-surface-secondary)] p-6 shadow-[var(--shadow-card)] transition-all duration-200 ease-[var(--ease-default)] hover:-translate-y-0.5 hover:border-l-[var(--color-brand-primary)] hover:shadow-[var(--shadow-card-hover)]"
              >
                <time
                  dateTime={n.date}
                  className="mb-2 block text-[13px] uppercase tracking-wide text-[var(--color-text-secondary)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {formatDate(n.date)}
                </time>
                <h2 className="mb-2 text-xl font-bold leading-snug text-[var(--color-text-primary)]">
                  {n.title}
                </h2>
                {n.summary && (
                  <p className="mb-3.5 line-clamp-3 text-[15px] leading-relaxed text-[var(--color-text-secondary)]">
                    {n.summary}
                  </p>
                )}
                {n.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {n.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded-full bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--color-brand-primary)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionContainer>
  );
}
