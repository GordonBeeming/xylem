interface ProjectStarsBadgeProps {
  stars: number;
}

export function ProjectStarsBadge({ stars }: ProjectStarsBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] px-2.5 py-1 text-[13px] font-medium text-[var(--color-text-secondary)]">
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-3.5 w-3.5 text-yellow-500"
        aria-hidden="true"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {stars.toLocaleString()}
    </span>
  );
}
