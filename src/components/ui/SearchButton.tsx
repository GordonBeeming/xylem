"use client";

import { useCommandPalette } from "@/hooks/useCommandPalette";
import { CommandPalette } from "@/components/ui/CommandPalette";

export function SearchButton() {
  const { isOpen, open, close } = useCommandPalette();

  return (
    <>
      <button
        onClick={open}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors duration-200 hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-brand-primary)]"
        aria-label="Search (⌘K)"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
      <CommandPalette isOpen={isOpen} onClose={close} posts={[]} />
    </>
  );
}
