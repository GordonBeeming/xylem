"use client";

import { useEffect, useState } from "react";
import type { HeadingEntry } from "@/lib/content";

const mono = { fontFamily: "var(--font-mono)" };

export function Toc({ headings }: { headings: HeadingEntry[] }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-90px 0px -70% 0px" }
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="toc">
      <div
        className="mb-[var(--space-4)]"
        style={{ ...mono, fontSize: "var(--text-2xs)", letterSpacing: "var(--ls-wider)", textTransform: "uppercase", color: "var(--text-subtle)" }}
      >
        On this page
      </div>
      <ul className="m-0 flex list-none flex-col gap-[var(--space-2)] p-0">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className="block pl-3 no-underline"
              style={{
                fontSize: "var(--text-sm)",
                lineHeight: "var(--lh-snug)",
                borderLeft: `2px solid ${active === h.id ? "var(--accent)" : "var(--border)"}`,
                color: active === h.id ? "var(--text)" : "var(--text-muted)",
                transition: "var(--transition-colors)",
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
