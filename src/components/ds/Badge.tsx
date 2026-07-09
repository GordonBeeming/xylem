interface BadgeProps {
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
  children: React.ReactNode;
  className?: string;
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-[var(--surface-2)] text-[var(--text-muted)] border border-[var(--border)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent-soft-text)] border border-transparent",
  success: "bg-[var(--secondary-soft)] text-[var(--success)] border border-transparent",
  warning: "bg-transparent text-[var(--warning)] border border-[var(--warning)]",
  danger: "bg-transparent text-[var(--danger)] border border-[var(--danger)]",
};

/** Xylem Badge — small status/metadata marker (project status, star counts). */
export function Badge({ tone = "neutral", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-[5px] whitespace-nowrap rounded-[var(--radius-sm)] px-2 py-1 text-[var(--text-2xs)] font-[var(--fw-medium)] leading-none tracking-[var(--ls-wide)] ${toneClasses[tone]} ${className}`.trim()}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}
