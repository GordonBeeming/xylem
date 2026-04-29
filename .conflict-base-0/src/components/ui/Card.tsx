import Link from "next/link";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  hoverable?: boolean;
}

export function Card({
  children,
  className = "",
  href,
  hoverable = false,
}: CardProps) {
  const baseClasses = `rounded-xl bg-[var(--color-surface-secondary)] shadow-[var(--shadow-card)] transition-all duration-[250ms] ease-[var(--ease-default)] ${
    hoverable
      ? "border-l-2 border-l-transparent hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] hover:border-l-[var(--color-brand-accent)]"
      : ""
  } ${href ? "cursor-pointer" : ""} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={`block ${baseClasses}`}>
        {children}
      </Link>
    );
  }

  return <div className={baseClasses}>{children}</div>;
}
