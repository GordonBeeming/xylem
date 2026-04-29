"use client";

import { useState } from "react";

interface ColorSwatchProps {
  name: string;
  hex: string;
  colorVar: string;
  description: string;
}

export function ColorSwatch({
  name,
  hex,
  colorVar,
  description,
}: ColorSwatchProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group flex w-full items-center gap-4 rounded-xl bg-[var(--color-surface-secondary)] p-4 shadow-[var(--shadow-card)] transition-all duration-200 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div
        className="h-16 w-16 shrink-0 rounded-lg border border-[var(--color-border-default)]"
        style={{ backgroundColor: hex }}
      />
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--color-text-primary)]">
            {name}
          </span>
          <code className="rounded bg-[var(--color-surface-tertiary)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-text-secondary)]">
            {hex}
          </code>
          {copied && (
            <span className="rounded bg-[var(--color-success)] px-1.5 py-0.5 text-xs font-medium text-white">
              Copied!
            </span>
          )}
        </div>
        <div className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
          {colorVar}
        </div>
        <div className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {description}
        </div>
      </div>
    </button>
  );
}
