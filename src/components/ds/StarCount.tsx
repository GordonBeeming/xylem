interface StarCountProps {
  n: number;
  className?: string;
}

/** GitHub-style star count chip — filled star + count. */
export function StarCount({ n, className = "" }: StarCountProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-[length:var(--text-sm)] font-[var(--fw-medium)] leading-none text-[color:var(--text-muted)] ${className}`.trim()}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="var(--star)"
        stroke="var(--star)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0"
      >
        <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.9l-5.81 3.06 1.11-6.47L2.6 9.9l6.5-.95L12 2.5z" />
      </svg>
      {n.toLocaleString()}
    </span>
  );
}
