"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

// Unique ID counter to avoid collisions when multiple diagrams exist on one page
let idCounter = 0;

export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const id = `mermaid-${++idCounter}`;
    const isDark = resolvedTheme === "dark";

    // Use the 'base' theme so we can override variables to match the blog's brand
    mermaid.initialize({
      startOnLoad: false,
      theme: "base",
      themeVariables: isDark
        ? {
            // Dark mode - matches blog's dark palette
            primaryColor: "#334155",
            primaryTextColor: "#E0E0E0",
            primaryBorderColor: "#46CBFF",
            lineColor: "#46CBFF",
            secondaryColor: "#2C2C2C",
            tertiaryColor: "#242424",
            textColor: "#E0E0E0",
            mainBkg: "#334155",
            nodeBorder: "#46CBFF",
            actorBkg: "#334155",
            actorBorder: "#46CBFF",
            actorTextColor: "#E0E0E0",
            actorLineColor: "#9CA3AF",
            signalColor: "#E0E0E0",
            signalTextColor: "#E0E0E0",
            labelBoxBkgColor: "#2C2C2C",
            labelBoxBorderColor: "#46CBFF",
            labelTextColor: "#E0E0E0",
            loopTextColor: "#E0E0E0",
            noteBkgColor: "#2C2C2C",
            noteTextColor: "#E0E0E0",
            noteBorderColor: "#46CBFF",
            activationBkgColor: "#334155",
            activationBorderColor: "#46CBFF",
            sequenceNumberColor: "#E0E0E0",
          }
        : {
            // Light mode - matches blog's light palette
            primaryColor: "#E9ECEF",
            primaryTextColor: "#1A1A1A",
            primaryBorderColor: "#0063B2",
            lineColor: "#0063B2",
            secondaryColor: "#F8F9FA",
            tertiaryColor: "#FFFFFF",
            textColor: "#1A1A1A",
            mainBkg: "#E9ECEF",
            nodeBorder: "#0063B2",
            actorBkg: "#E9ECEF",
            actorBorder: "#0063B2",
            actorTextColor: "#1A1A1A",
            actorLineColor: "#6B7280",
            signalColor: "#1A1A1A",
            signalTextColor: "#1A1A1A",
            labelBoxBkgColor: "#FFFFFF",
            labelBoxBorderColor: "#0063B2",
            labelTextColor: "#1A1A1A",
            loopTextColor: "#1A1A1A",
            noteBkgColor: "#FFFFFF",
            noteTextColor: "#1A1A1A",
            noteBorderColor: "#0063B2",
            activationBkgColor: "#E9ECEF",
            activationBorderColor: "#0063B2",
            sequenceNumberColor: "#FFFFFF",
          },
      flowchart: { useMaxWidth: true },
      sequence: { useMaxWidth: true },
    });

    mermaid
      .render(id, chart.trim())
      .then(({ svg: renderedSvg }) => {
        setSvg(renderedSvg);
        setError("");
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      });
  }, [chart, resolvedTheme]);

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300">
        <p className="font-medium">Mermaid diagram error</p>
        <pre className="mt-2 whitespace-pre-wrap text-xs">{error}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 flex h-32 items-center justify-center rounded-xl border border-[var(--color-border-default)] bg-[var(--color-surface-secondary)]">
        <span className="text-sm text-[var(--color-text-secondary)]">
          Loading diagram...
        </span>
      </div>
    );
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-[var(--color-border-default)]">
      {title && (
        <div className="border-b border-[var(--color-border-default)] bg-[var(--color-surface-tertiary)] px-4 py-2">
          <span
            className="text-[13px] font-medium text-[var(--color-text-secondary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {title}
          </span>
        </div>
      )}
      <div
        ref={containerRef}
        className="overflow-x-auto bg-[var(--color-surface-secondary)] p-4 [&_svg]:mx-auto"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
