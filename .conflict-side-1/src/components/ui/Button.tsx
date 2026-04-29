import Link from "next/link";

interface ButtonBaseProps {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface ButtonAsButton
  extends ButtonBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> {
  href?: undefined;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantStyles: Record<string, string> = {
  primary:
    "bg-[var(--color-brand-primary)] text-[var(--color-text-on-primary)] hover:bg-[var(--color-interactive-hover)]",
  secondary:
    "bg-[var(--color-surface-tertiary)] text-[var(--color-text-primary)] hover:brightness-95",
  ghost:
    "bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)]",
  outline:
    "border border-[var(--color-border-strong)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-tertiary)]",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-sm min-h-[36px]",
  md: "px-5 py-2.5 text-[15px] min-h-[44px]",
  lg: "px-7 py-3 text-base min-h-[52px]",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const baseClasses = `inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ease-[var(--ease-default)] ${
    variantStyles[variant]
  } ${sizeStyles[size]} ${
    disabled ? "opacity-50 pointer-events-none" : ""
  } ${className}`.trim();

  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link href={rest.href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  const { href: _href, ...buttonProps } = rest as ButtonAsButton;
  return (
    <button
      className={baseClasses}
      disabled={disabled}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
