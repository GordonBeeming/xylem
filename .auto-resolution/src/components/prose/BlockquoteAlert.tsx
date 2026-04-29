interface BlockquoteAlertProps {
  type: "note" | "tip" | "warning" | "caution" | "important";
  children: React.ReactNode;
}

const alertConfig: Record<
  string,
  { borderColor: string; bgColor: string; icon: React.ReactNode; label: string }
> = {
  note: {
    borderColor: "border-l-[var(--color-info)]",
    bgColor: "bg-[color-mix(in_srgb,var(--color-info)_5%,transparent)]",
    label: "Note",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
  tip: {
    borderColor: "border-l-[var(--color-success)]",
    bgColor: "bg-[color-mix(in_srgb,var(--color-success)_5%,transparent)]",
    label: "Tip",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14" />
      </svg>
    ),
  },
  warning: {
    borderColor: "border-l-[var(--color-warning)]",
    bgColor: "bg-[color-mix(in_srgb,var(--color-warning)_5%,transparent)]",
    label: "Warning",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  caution: {
    borderColor: "border-l-[var(--color-error)]",
    bgColor: "bg-[color-mix(in_srgb,var(--color-error)_5%,transparent)]",
    label: "Caution",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M8.56 2.9A7 7 0 0 1 19 9v4a1 1 0 0 0 .293.707l1.414 1.414A1 1 0 0 1 20 17H4a1 1 0 0 1-.707-1.879l1.414-1.414A1 1 0 0 0 5 13V9a7 7 0 0 1 3.56-6.1" />
        <path d="M9.5 21a2.5 2.5 0 0 0 5 0" />
      </svg>
    ),
  },
  important: {
    borderColor: "border-l-purple-500",
    bgColor: "bg-purple-500/5",
    label: "Important",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
};

export function BlockquoteAlert({ type, children }: BlockquoteAlertProps) {
  const config = alertConfig[type];

  return (
    <div
      className={`my-6 rounded-r-lg border-l-4 ${config.borderColor} ${config.bgColor} px-5 py-4`}
    >
      <div
        className={`mb-2 flex items-center gap-2 text-sm font-medium ${
          type === "note"
            ? "text-[var(--color-info)]"
            : type === "tip"
            ? "text-[var(--color-success)]"
            : type === "warning"
            ? "text-[var(--color-warning)]"
            : type === "caution"
            ? "text-[var(--color-error)]"
            : "text-purple-500"
        }`}
      >
        {config.icon}
        {config.label}
      </div>
      <div className="text-[var(--color-text-primary)] [&_p]:mb-0">
        {children}
      </div>
    </div>
  );
}
