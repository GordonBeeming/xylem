import type { ReactNode } from "react";

export function TinaPreviewMessage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ maxWidth: "40rem", margin: "4rem auto", padding: "0 1.5rem" }}>
      <div className="eyebrow" style={{ letterSpacing: "var(--ls-wider)" }}>
        Tina preview
      </div>
      <h1
        className="mt-4"
        style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-regular)", color: "var(--text)" }}
      >
        {title}
      </h1>
      <div
        className="mt-[var(--space-4)]"
        style={{ maxWidth: "52ch", fontSize: "var(--text-md)", lineHeight: "var(--lh-relaxed)", color: "var(--text-muted)" }}
      >
        {children}
      </div>
    </div>
  );
}
