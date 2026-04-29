"use client";

import { useFeatureFlag } from "@/hooks/useFeatureFlag";

interface EditInTinaButtonProps {
  relativePath: string;
}

export function EditInTinaButton({ relativePath }: EditInTinaButtonProps) {
  const enabled = useFeatureFlag("edit-in-tina");

  if (!enabled) return null;

  const slug = relativePath.replace(/\.mdx$/, "");
  const editUrl = `/admin/index.html#/~/blog/${slug}`;

  return (
    <a
      href={editUrl}
      title="Edit in Tina"
      className="inline-flex items-center justify-center text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-brand-primary)]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
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
      <span className="sr-only">Edit in Tina</span>
    </a>
  );
}
