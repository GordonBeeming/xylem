"use client";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";

interface EditInTinaButtonProps {
  relativePath: string;
}

export function EditInTinaButton({ relativePath }: EditInTinaButtonProps) {
  const enabled = useFeatureFlag("edit-in-tina");

  if (!enabled) return null;

  const editUrl = `/admin#/~/${relativePath}`;

  return (
    <a
      href={editUrl}
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-surface-secondary)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
      Edit in Tina
    </a>
  );
}
