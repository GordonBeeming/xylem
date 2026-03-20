interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "tag" | "tech" | "success" | "warning" | "error";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default:
    "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
  tag: "bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] text-[var(--color-brand-primary)] uppercase text-xs tracking-wide",
  tech: "bg-[color-mix(in_srgb,var(--color-brand-accent)_10%,transparent)] text-[var(--color-brand-accent)]",
  success:
    "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]",
  warning:
    "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]",
  error:
    "bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)] text-[var(--color-error)]",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${variantStyles[variant]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
