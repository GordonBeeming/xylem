"use client";

import { useEffect, useRef, useState } from "react";

function rgbToHex(rgb: string): string {
  const m = rgb.match(/\d+/g);
  if (!m) return rgb;
  const [r, g, b] = m.map(Number);
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}

interface ColorSwatchProps {
  token: string;
  big?: boolean;
}

const mono = { fontFamily: "var(--font-mono)" };

export function ColorSwatch({ token, big }: ColorSwatchProps) {
  const swatchRef = useRef<HTMLSpanElement>(null);
  const [hex, setHex] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const el = swatchRef.current;
    if (!el) return;

    const read = () => setHex(rgbToHex(getComputedStyle(el).backgroundColor));
    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard unavailable — swatch still displays the hex for manual copy
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${hex}`}
      className="flex cursor-pointer flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-0 text-left transition-[var(--transition-colors)] hover:border-[var(--border-strong)]"
    >
      <span ref={swatchRef} className="block" style={{ height: big ? 56 : 44, background: `var(${token})` }} />
      <span className="px-2.5 py-2">
        <span
          className="block truncate text-[length:var(--text-2xs)] text-[color:var(--text)]"
          style={mono}
        >
          {token}
        </span>
        <span
          className="block text-[length:var(--text-2xs)]"
          style={{ ...mono, color: copied ? "var(--accent)" : "var(--text-subtle)" }}
        >
          {copied ? "copied ✓" : hex}
        </span>
      </span>
    </button>
  );
}
