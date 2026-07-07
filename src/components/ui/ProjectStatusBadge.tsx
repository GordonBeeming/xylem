interface ProjectStatusBadgeProps {
  status: string;
}

// Deprecated reads as a warning (warm amber); anything else — "Private preview" and
// future states — leans on the brand accent. Colours are set explicitly per theme so
// the pill never inherits a card's text colour and vanishes on one background.
function toneClasses(status: string): string {
  if (status.trim().toLowerCase() === "deprecated") {
    return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
  }
  return "bg-[color-mix(in_srgb,var(--color-brand-primary)_12%,transparent)] text-[var(--color-brand-primary)]";
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-medium ${toneClasses(status)}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}
