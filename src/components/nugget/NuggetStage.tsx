"use client";

import { useEffect, useState } from "react";
import { NuggetFrame } from "@/components/NuggetFrame";

interface NuggetStageProps {
  rawUrl: string;
  title: string;
  filename: string;
}

const mono = { fontFamily: "var(--font-mono)" };

function StageButton({ onClick, children, title, href }: { onClick?: () => void; children: React.ReactNode; title: string; href?: string }) {
  const className =
    "rounded-[var(--radius-xs)] border border-[var(--border)] px-[9px] py-[3px] text-[length:var(--text-2xs)] text-[color:var(--text-muted)] transition-[var(--transition-colors)] hover:border-[var(--border-strong)] hover:text-[color:var(--text)] cursor-pointer no-underline";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" title={title} style={mono} className={className}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} title={title} style={mono} className={className}>
      {children}
    </button>
  );
}

export function NuggetStage({ rawUrl, title, filename }: NuggetStageProps) {
  const [full, setFull] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full]);

  return (
    <div className={`nugget-stage${full ? " full" : ""}`}>
      <div className="nugget-frame">
        <div className="nugget-bar">
          <div className="flex min-w-0 items-center gap-[var(--space-3)]">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--border-strong)" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--border-strong)" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--accent)" }} />
            </span>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[length:var(--text-xs)] text-[color:var(--text-muted)]" style={mono}>
              {filename}
            </span>
            <span
              className="shrink-0 rounded-[var(--radius-xs)] border border-[var(--border)] px-[7px] py-[1px] text-[length:var(--text-2xs)] text-[color:var(--text-subtle)]"
              style={mono}
            >
              sandboxed
            </span>
          </div>
          <div className="flex gap-1.5">
            <StageButton onClick={() => setReloadKey((k) => k + 1)} title="Reload the demo">
              ⟳ reload
            </StageButton>
            <StageButton onClick={() => setFull((f) => !f)} title="Toggle fullscreen">
              {full ? "⤢ exit" : "⤢ fullscreen"}
            </StageButton>
            <StageButton href={rawUrl} title="Open in a new tab">
              ↗ open
            </StageButton>
          </div>
        </div>
        <NuggetFrame key={reloadKey} src={rawUrl} title={title} fillHeight={full} />
      </div>
      <div className="mt-[var(--space-4)] text-center text-[length:var(--text-2xs)] tracking-[var(--ls-wide)] text-[color:var(--text-subtle)]" style={mono}>
        Embedded as a standalone HTML file · runs in a sandboxed iframe · styling is the nugget&apos;s own
      </div>
    </div>
  );
}
