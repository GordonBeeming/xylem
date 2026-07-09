import Link from "next/link";

type TagTone = "neutral" | "accent" | "growth";
type TagSize = "sm" | "md";

interface TagOwnProps {
  tone?: TagTone;
  size?: TagSize;
  children: React.ReactNode;
  className?: string;
}

type TagAsSpan = TagOwnProps &
  Omit<React.HTMLAttributes<HTMLSpanElement>, keyof TagOwnProps> & { as?: "span"; href?: undefined };

type TagAsLink = TagOwnProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof TagOwnProps> & { as: "a"; href: string };

type TagProps = TagAsSpan | TagAsLink;

const toneClasses: Record<TagTone, string> = {
  neutral: "bg-[var(--surface-2)] text-[color:var(--text-muted)] border border-[var(--border)]",
  accent: "bg-[var(--accent-soft)] text-[color:var(--accent-soft-text)] border border-transparent",
  growth: "bg-[var(--secondary-soft)] text-[color:var(--secondary)] border border-transparent",
};

const sizeClasses: Record<TagSize, string> = {
  sm: "text-[length:var(--text-2xs)] px-2 py-0.5",
  md: "text-[length:var(--text-xs)] px-2.5 py-[3px]",
};

/** Xylem Tag — the mono pill used across posts & nuggets taxonomy. */
export function Tag({ tone = "neutral", size = "md", children, className = "", ...rest }: TagProps) {
  const classes = `inline-flex items-center whitespace-nowrap rounded-[999px] font-[var(--fw-medium)] leading-[1.4] tracking-[var(--ls-wide)] no-underline transition-[var(--transition-colors)] ${toneClasses[tone]} ${sizeClasses[size]} ${className}`.trim();
  const style = { fontFamily: "var(--font-mono)" };

  if (rest.as === "a") {
    const { as: _as, href, ...linkRest } = rest;
    void _as;
    return (
      <Link href={href} className={classes} style={style} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { as: _as, ...spanRest } = rest as TagAsSpan;
  void _as;
  return (
    <span className={classes} style={style} {...spanRest}>
      {children}
    </span>
  );
}
