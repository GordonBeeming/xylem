interface TagProps {
  tone?: "neutral" | "accent" | "growth";
  size?: "sm" | "md";
  children: React.ReactNode;
  className?: string;
}

const toneClasses: Record<NonNullable<TagProps["tone"]>, string> = {
  neutral: "bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent-soft-text)] border border-transparent",
  growth: "bg-[var(--secondary-soft)] text-[var(--secondary)] border border-transparent",
};

const sizeClasses: Record<NonNullable<TagProps["size"]>, string> = {
  sm: "text-[var(--text-2xs)] px-2 py-0.5",
  md: "text-[var(--text-xs)] px-2.5 py-[3px]",
};

/** Xylem Tag — the mono pill used across posts & nuggets taxonomy. */
export function Tag({ tone = "neutral", size = "md", children, className = "" }: TagProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-[var(--radius-pill,999px)] font-[var(--fw-medium)] leading-[1.4] tracking-[var(--ls-wide)] transition-[var(--transition-colors)] ${toneClasses[tone]} ${sizeClasses[size]} ${className}`.trim()}
      style={{ fontFamily: "var(--font-mono)", borderRadius: 999 }}
    >
      {children}
    </span>
  );
}
