interface AnchorHeadingProps {
  level: 2 | 3 | 4;
  id: string;
  children: React.ReactNode;
}

export function AnchorHeading({ level, id, children }: AnchorHeadingProps) {
  const Tag = `h${level}` as const;

  const sizeClasses: Record<number, string> = {
    2: "text-[28px] font-extrabold tracking-tight mt-12 mb-4",
    3: "text-[22px] font-extrabold tracking-tight mt-9 mb-3",
    4: "text-lg font-bold mt-6 mb-2",
  };

  return (
    <Tag
      id={id}
      className={`group relative flex items-center scroll-mt-20 text-[var(--color-text-primary)] ${sizeClasses[level]}`}
    >
      <a
        href={`#${id}`}
        className="absolute -left-7 flex items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]"
        aria-label="Link to this section"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px]"
          aria-hidden="true"
        >
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      </a>
      {children}
    </Tag>
  );
}
