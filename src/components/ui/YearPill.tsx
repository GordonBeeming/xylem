import Link from "next/link";

interface YearPillProps {
  year: string;
  count?: number;
  active?: boolean;
}

export function YearPill({ year, count, active = false }: YearPillProps) {
  const baseClasses = `inline-block rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
    active
      ? "bg-[var(--color-brand-primary)] text-[var(--color-text-on-primary)]"
      : "bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] text-[var(--color-brand-primary)] hover:brightness-95"
  }`;

  return (
    <Link href={`/years/${year}`} className={baseClasses}>
      {year}
      {count !== undefined && count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
