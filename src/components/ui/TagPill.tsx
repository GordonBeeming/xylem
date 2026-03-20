import Link from "next/link";
import { slug } from "github-slugger";

interface TagPillProps {
  tag: string;
  count?: number;
  active?: boolean;
  href?: string;
}

export function TagPill({ tag, count, active = false, href }: TagPillProps) {
  const slugified = slug(tag).replace(/--+/g, "-");
  const resolvedHref = href ?? `/tags/${encodeURIComponent(slugified)}`;

  const baseClasses = `inline-block rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide whitespace-nowrap transition-all duration-200 ${
    active
      ? "bg-[var(--color-brand-primary)] text-[var(--color-text-on-primary)]"
      : "bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] text-[var(--color-brand-primary)] hover:brightness-95"
  }`;

  return (
    <Link href={resolvedHref} className={baseClasses}>
      {tag}
      {count !== undefined && count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
