import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonAsButton = ButtonOwnProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps> & {
    as?: "button";
    href?: undefined;
  };

type ButtonAsLink = ButtonOwnProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonOwnProps> & {
    as: "a";
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsLink;

const sizeStyles: Record<ButtonSize, string> = {
  sm: "gap-1.5 px-3 py-1.5 text-[length:var(--text-sm)] h-8",
  md: "gap-2 px-4 py-2.5 text-[length:var(--text-sm)] h-10",
  lg: "gap-2.5 px-[22px] py-3 text-[length:var(--text-base)] h-12",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-[var(--accent)] text-[color:var(--text-on-accent)] border border-transparent",
  secondary: "bg-[var(--surface)] text-[color:var(--text)] border border-[var(--border-strong)]",
  ghost: "bg-transparent text-[color:var(--link)] border border-transparent",
  danger: "bg-transparent text-[color:var(--danger)] border border-[var(--border-strong)]",
};

/** Xylem Button — geometric, restrained. `primary` is the only filled variant. */
export function Button({
  variant = "secondary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const classes = `${fullWidth ? "flex w-full" : "inline-flex"} items-center justify-center box-border font-[var(--fw-semibold)] leading-none tracking-[-0.005em] rounded-[var(--radius-md)] whitespace-nowrap no-underline transition-[color,background-color,border-color,transform,box-shadow] duration-[var(--dur-fast)] ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer active:translate-y-[0.5px]"} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`.trim();
  const content = (
    <>
      {iconLeft && <span className="inline-flex h-[1.05em] w-[1.05em]">{iconLeft}</span>}
      {children}
      {iconRight && <span className="inline-flex h-[1.05em] w-[1.05em]">{iconRight}</span>}
    </>
  );

  if (rest.as === "a") {
    const { as: _as, href, ...anchorRest } = rest;
    void _as;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {content}
      </Link>
    );
  }

  const { as: _as, ...buttonRest } = rest as ButtonAsButton;
  void _as;
  return (
    <button className={classes} disabled={disabled} {...buttonRest}>
      {content}
    </button>
  );
}
