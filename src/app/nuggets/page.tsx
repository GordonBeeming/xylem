import type { Metadata } from "next";
import { getAllNuggets } from "@/lib/nuggets";
import { formatDateShort } from "@/lib/content";
import { Card } from "@/components/ds/Card";
import { Tag } from "@/components/ds/Tag";

export const metadata: Metadata = {
  title: "Nuggets",
  description:
    "Small, self-contained explainers by Gordon Beeming — mini knowledge drops on narrow technical topics.",
};

const mono = { fontFamily: "var(--font-mono)" };

export default function NuggetsPage() {
  const nuggets = getAllNuggets();

  return (
    <div className="page">
      <div className="eyebrow" style={{ color: "var(--secondary)" }}>
        Nuggets
      </div>
      <h1
        className="mt-3"
        style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", color: "var(--text)" }}
      >
        Interactive demos
      </h1>
      <p
        className="mt-2.5 max-w-[var(--width-prose)]"
        style={{ fontSize: "var(--text-md)", color: "var(--text-muted)", lineHeight: "var(--lh-relaxed)" }}
      >
        Small, standalone HTML explainers — each one a self-contained demo you can poke
        at. Built to make one idea click.
      </p>

      {nuggets.length === 0 ? (
        <p className="mt-10" style={{ color: "var(--text-subtle)" }}>
          No nuggets yet — check back soon.
        </p>
      ) : (
        <div
          className="mt-[var(--space-10)] grid gap-[var(--space-5)]"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
        >
          {nuggets.map((n) => (
            <Card key={n.slug} interactive href={`/nuggets/${n.slug}`} className="flex flex-col">
              <div
                className="mb-[var(--space-5)] flex items-center gap-[var(--space-3)] rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-2"
                style={{ background: "var(--surface-2)" }}
              >
                <span className="flex gap-[5px]">
                  <span className="h-2 w-2 rounded-full" style={{ background: "var(--border-strong)" }} />
                  <span className="h-2 w-2 rounded-full" style={{ background: "var(--border-strong)" }} />
                  <span className="h-2 w-2 rounded-full" style={{ background: "var(--secondary)" }} />
                </span>
                <span
                  className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[length:var(--text-2xs)] text-[color:var(--text-muted)]"
                  style={mono}
                >
                  {n.slug}.html
                </span>
              </div>
              <h3
                style={{ margin: 0, fontSize: "var(--text-base)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-tight)", lineHeight: "var(--lh-snug)", color: "var(--text)" }}
              >
                {n.title}
              </h3>
              {n.summary && (
                <p className="mt-2 flex-1" style={{ fontSize: "var(--text-sm)", lineHeight: "var(--lh-normal)", color: "var(--text-muted)" }}>
                  {n.summary}
                </p>
              )}
              <div className="mt-[var(--space-4)] flex items-center justify-between">
                <div className="flex gap-1.5">
                  {n.tags.slice(0, 2).map((t) => (
                    <Tag key={t} size="sm">
                      {t}
                    </Tag>
                  ))}
                </div>
                <span className="text-[length:var(--text-2xs)] uppercase text-[color:var(--text-subtle)]" style={mono}>
                  {formatDateShort(n.date)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
