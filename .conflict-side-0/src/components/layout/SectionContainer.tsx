interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "narrow" | "wide";
}

const variantStyles: Record<string, string> = {
  default: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  narrow: "max-w-3xl mx-auto px-4 sm:px-6",
  wide: "w-full px-4 sm:px-6 lg:px-8",
};

export function SectionContainer({
  children,
  className = "",
  variant = "default",
}: SectionContainerProps) {
  return (
    <div className={`${variantStyles[variant]} ${className}`.trim()}>
      {children}
    </div>
  );
}
