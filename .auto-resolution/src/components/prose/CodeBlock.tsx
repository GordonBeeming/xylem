"use client";

import type { ReactNode } from "react";
import { CopyButton } from "@/components/ui/CopyButton";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  children?: ReactNode;
}

export function CodeBlock({ code, language, filename, children }: CodeBlockProps) {
  return (
    <div className="my-6 overflow-hidden rounded-xl border border-[var(--color-border-default)]">
      {(filename || language) && (
        <div className="flex items-center justify-between border-b border-[var(--color-border-default)] bg-[var(--color-surface-tertiary)] px-4 py-2">
          {filename && (
            <span
              className="text-[13px] font-medium text-[var(--color-text-secondary)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {filename}
            </span>
          )}
          {!filename && <span />}
          {language && (
            <span
              className="rounded-full bg-[color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-brand-primary)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {language}
            </span>
          )}
        </div>
      )}
      <div className="relative bg-[var(--color-surface-secondary)]">
        <div className="absolute right-2 top-2 z-10">
          <CopyButton text={code} />
        </div>
        {children ? (
          <pre
            className="codeblock-highlighted codeblock-line-numbers overflow-x-auto p-4 text-sm leading-relaxed"
            style={{ fontFamily: "var(--font-mono)", background: "transparent" }}
          >
            {children}
          </pre>
        ) : (
          <pre className="overflow-x-auto p-4" style={{ fontFamily: "var(--font-mono)" }}>
            <code className="text-sm leading-relaxed text-[var(--color-text-primary)]">
              {code}
            </code>
          </pre>
        )}
      </div>
    </div>
  );
}
