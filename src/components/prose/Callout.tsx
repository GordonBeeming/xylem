interface CalloutProps {
  variant?: "note" | "tip" | "warning" | "collab";
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variants: Record<NonNullable<CalloutProps["variant"]>, { bg: string; bar: string; label: string; emoji: string }> = {
  note: { bg: "var(--surface-2)", bar: "var(--border-strong)", label: "var(--text-muted)", emoji: "ℹ️" },
  tip: { bg: "var(--secondary-soft)", bar: "var(--secondary)", label: "var(--secondary)", emoji: "🌱" },
  warning: { bg: "var(--accent-soft)", bar: "var(--warning)", label: "var(--warning)", emoji: "⚠️" },
  collab: { bg: "var(--accent-soft)", bar: "var(--accent)", label: "var(--accent-soft-text)", emoji: "🤝" },
};

/** Xylem Callout — an aside inside prose. Explicit `<Callout variant="tip">` JSX in MDX, same pattern as Figure/YouTubeEmbed/Walkthrough. */
export function Callout({ variant = "note", title, icon, children }: CalloutProps) {
  const v = variants[variant];
  return (
    <aside
      className="my-6 flex gap-[var(--space-4)] rounded-[var(--radius-sm)] p-[var(--space-5)]"
      style={{ background: v.bg, borderLeft: `3px solid ${v.bar}` }}
    >
      <span aria-hidden="true" className="flex-shrink-0 text-[1.1em] leading-[1.4]">
        {icon || v.emoji}
      </span>
      <div className="min-w-0">
        {title && (
          <div className="mb-1 font-[var(--fw-semibold)] text-[length:var(--text-base)]" style={{ color: v.label }}>
            {title}
          </div>
        )}
        <div className="text-[length:var(--text-sm)] leading-[var(--lh-relaxed)] text-[color:var(--text-muted)] [&_p]:m-0">
          {children}
        </div>
      </div>
    </aside>
  );
}
