import Link from "next/link";

interface CardOwnProps {
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

type CardAsDiv = CardOwnProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof CardOwnProps> & { href?: undefined };

type CardAsLink = CardOwnProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CardOwnProps> & { href: string };

type CardProps = CardAsDiv | CardAsLink;

const paddingStyles: Record<NonNullable<CardOwnProps["padding"]>, string> = {
  none: "p-0",
  sm: "p-[var(--space-4)]",
  md: "p-[var(--space-5)]",
  lg: "p-[var(--space-6)]",
};

/** Xylem Card — the primary surface container. Hairline border, soft shadow, subtle lift when `interactive`. */
export function Card({
  interactive = false,
  padding = "lg",
  className = "",
  children,
  ...rest
}: CardProps) {
  const classes = `block box-border bg-[var(--surface)] border border-[var(--border-strong)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] text-[color:var(--text)] no-underline transition-[transform,box-shadow,border-color] duration-[var(--dur-base)] ${interactive ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] hover:border-[var(--accent)]" : "cursor-default"} ${paddingStyles[padding]} ${className}`.trim();

  if (rest.href !== undefined) {
    const { href, ...linkRest } = rest as CardAsLink;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const divRest = rest as CardAsDiv;
  return (
    <div className={classes} {...divRest}>
      {children}
    </div>
  );
}
