"use client";

import { useScrollProgress } from "@/hooks/useScrollProgress";

export function ReadingProgressBar() {
  const progress = useScrollProgress();

  return (
    <div
      className="fixed left-0 top-0 z-[10000] h-[3px] bg-[var(--color-brand-highlight)] transition-[width] duration-150 ease-out"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    />
  );
}
