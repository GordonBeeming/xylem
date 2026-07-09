"use client";

import { useState, useCallback, type ReactNode } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  children?: ReactNode;
}

export function CodeBlock({ code, language, filename, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch (error) {
      console.error("Failed to copy code to clipboard:", error);
    }
  }, [code]);

  return (
    <div
      className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--code-border)] bg-[var(--code-bg)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <div className="flex items-center justify-between border-b border-[var(--code-border)] bg-[var(--surface-2)] px-3.5 py-2">
        <span className="text-[length:var(--text-2xs)] tracking-[var(--ls-wide)] text-[color:var(--text-subtle)] uppercase">
          {filename || language || "text"}
        </span>
        <button
          onClick={copy}
          className="text-[length:var(--text-2xs)] tracking-[var(--ls-wide)] uppercase transition-[var(--transition-colors)] cursor-pointer"
          style={{ color: copied ? "var(--accent)" : "var(--text-muted)" }}
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>
      {children ? (
        <pre className="codeblock-highlighted codeblock-line-numbers overflow-x-auto p-[var(--space-5)] text-[length:var(--text-sm)] leading-[var(--lh-relaxed)]" style={{ background: "transparent" }}>
          {children}
        </pre>
      ) : (
        <pre className="overflow-x-auto p-[var(--space-5)]">
          <code className="text-[length:var(--text-sm)] leading-[var(--lh-relaxed)] text-[color:var(--code-text)]">
            {code}
          </code>
        </pre>
      )}
    </div>
  );
}
