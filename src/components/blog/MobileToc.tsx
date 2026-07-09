import type { HeadingEntry } from "@/lib/content";

const mono = { fontFamily: "var(--font-mono)" };

export function MobileToc({ headings }: { headings: HeadingEntry[] }) {
  if (headings.length === 0) return null;

  return (
    <details className="toc-mobile">
      <summary
        className="flex cursor-pointer items-center justify-between rounded-[var(--radius-md)] border p-[var(--space-4)]"
        style={{ listStyle: "none", border: "1px solid var(--border)", background: "var(--surface-2)" }}
      >
        <span style={{ ...mono, fontSize: "var(--text-2xs)", letterSpacing: "var(--ls-wider)", textTransform: "uppercase", color: "var(--text-muted)" }}>
          On this page
        </span>
        <span style={{ ...mono, fontSize: "var(--text-2xs)", color: "var(--text-subtle)" }}>
          {headings.length} section{headings.length !== 1 ? "s" : ""} ▾
        </span>
      </summary>
      <ul className="m-0 mt-2 flex list-none flex-col gap-0.5 p-0">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className="block border-l-2 py-[9px] pl-3 no-underline"
              style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", borderColor: "var(--border)" }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
