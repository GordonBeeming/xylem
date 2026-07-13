"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import mermaid from "mermaid";
import { stripMermaidColors } from "@/lib/mermaid-theme";

interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

// Unique ID counter to avoid collisions when multiple diagrams exist on one page
let idCounter = 0;

// Track the last theme we initialized mermaid with so we only reinitialize
// when the theme actually changes, not on every component mount.
let lastInitializedTheme: string | null = null;

function initMermaidForTheme(isDark: boolean) {
  const themeKey = isDark ? "dark" : "light";
  if (lastInitializedTheme === themeKey) return;

  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
    themeVariables: isDark
      ? {
          primaryColor: "#132e34",
          primaryTextColor: "#e8eef6",
          primaryBorderColor: "#22d3ee",
          lineColor: "#22d3ee",
          secondaryColor: "#111a2e",
          tertiaryColor: "#0b1120",
          textColor: "#e8eef6",
          mainBkg: "#132e34",
          nodeBorder: "#22d3ee",
          actorBkg: "#132e34",
          actorBorder: "#22d3ee",
          actorTextColor: "#e8eef6",
          actorLineColor: "#64748b",
          signalColor: "#e8eef6",
          signalTextColor: "#e8eef6",
          labelBoxBkgColor: "#111a2e",
          labelBoxBorderColor: "#22d3ee",
          labelTextColor: "#e8eef6",
          loopTextColor: "#e8eef6",
          noteBkgColor: "#111a2e",
          noteTextColor: "#e8eef6",
          noteBorderColor: "#22d3ee",
          activationBkgColor: "#132e34",
          activationBorderColor: "#22d3ee",
          sequenceNumberColor: "#04252e",
          // Subgraph (cluster) chrome — mermaid's base defaults render these
          // near-black, so the solid + dashed grouping boxes vanished on the
          // dark card. A light slate border reads as a grouping boundary,
          // distinct from the cyan node borders.
          clusterBkg: "#0f1c2e",
          clusterBorder: "#8595ad",
          titleColor: "#e8eef6",
        }
      : {
          primaryColor: "#e7f6f8",
          primaryTextColor: "#0f172a",
          primaryBorderColor: "#0e7490",
          lineColor: "#0e7490",
          secondaryColor: "#f1f5f9",
          tertiaryColor: "#ffffff",
          textColor: "#0f172a",
          mainBkg: "#e7f6f8",
          nodeBorder: "#0e7490",
          actorBkg: "#e7f6f8",
          actorBorder: "#0e7490",
          actorTextColor: "#0f172a",
          actorLineColor: "#64748b",
          signalColor: "#0f172a",
          signalTextColor: "#0f172a",
          labelBoxBkgColor: "#ffffff",
          labelBoxBorderColor: "#0e7490",
          labelTextColor: "#0f172a",
          loopTextColor: "#0f172a",
          noteBkgColor: "#ffffff",
          noteTextColor: "#0f172a",
          noteBorderColor: "#0e7490",
          activationBkgColor: "#e7f6f8",
          activationBorderColor: "#0e7490",
          sequenceNumberColor: "#ffffff",
          // See dark-theme note above — a mid-slate boundary keeps the solid +
          // dashed subgraph boxes visible on the light card.
          clusterBkg: "#f1f5f9",
          clusterBorder: "#64748b",
          titleColor: "#0f172a",
        },
    flowchart: { useMaxWidth: true },
    sequence: { useMaxWidth: true },
  });

  lastInitializedTheme = themeKey;
}

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  // Stores bindFunctions so we can call it after the SVG is in the DOM
  const bindFunctionsRef = useRef<((element: Element) => void) | null>(null);
  const { resolvedTheme } = useTheme();

  const renderDiagram = useCallback(async (signal: { cancelled: boolean }) => {
    const id = `mermaid-${++idCounter}`;
    const isDark = resolvedTheme === "dark";
    initMermaidForTheme(isDark);

    try {
      const result = await mermaid.render(id, stripMermaidColors(chart.trim()));
      if (signal.cancelled) return;

      bindFunctionsRef.current = result.bindFunctions ?? null;
      setSvg(result.svg);
      setError("");
    } catch (err: unknown) {
      if (signal.cancelled) return;
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  }, [chart, resolvedTheme]);

  useEffect(() => {
    const signal = { cancelled: false };
    renderDiagram(signal);
    return () => { signal.cancelled = true; };
  }, [renderDiagram]);

  // Call bindFunctions after the SVG is injected into the DOM so that
  // mermaid event handlers (link clicks, tooltips) work correctly.
  useEffect(() => {
    if (svg && containerRef.current && bindFunctionsRef.current) {
      bindFunctionsRef.current(containerRef.current);
    }
  }, [svg]);

  if (error) {
    return (
      <div className="my-6 rounded-[var(--radius-lg)] border border-[var(--danger)] bg-[var(--code-bg)] p-4 text-[length:var(--text-sm)] text-[color:var(--danger)]">
        <p className="font-[var(--fw-medium)]">Mermaid diagram error</p>
        <pre className="mt-2 whitespace-pre-wrap text-[length:var(--text-xs)]">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 flex h-32 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--code-border)] bg-[var(--code-bg)]">
        <span className="text-[length:var(--text-sm)] text-[color:var(--text-muted)]">
          Loading diagram...
        </span>
      </div>
    );
  }

  return (
    <div className="my-6 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--code-border)] bg-[var(--code-bg)]">
      {title && (
        <div className="border-b border-[var(--code-border)] bg-[var(--surface-2)] px-3.5 py-2">
          <span
            className="text-[length:var(--text-2xs)] tracking-[var(--ls-wide)] text-[color:var(--text-subtle)] uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {title}
          </span>
        </div>
      )}
      <div
        ref={containerRef}
        className="overflow-x-auto p-[var(--space-5)] [&_svg]:mx-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
