import type { Metadata } from "next";
import { ColorSwatch } from "@/components/ds/ColorSwatch";

export const metadata: Metadata = {
  title: "Color Palette",
  description: "The Signal palette used across Gordon Beeming's blog — click any swatch to copy its hex.",
  openGraph: {
    title: "Color Palette | Gordon Beeming",
    description: "The Signal palette used across Gordon Beeming's blog.",
  },
};

interface Ramp {
  name: string;
  note: string;
  steps: string[];
}

const RAMPS: Ramp[] = [
  {
    name: "Current — teal-cyan accent",
    note: "The one accent. Sparingly: links, primary actions, emphasis.",
    steps: ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"].map((s) => `--current-${s}`),
  },
  {
    name: "Slate — cool neutrals",
    note: "Carries ~90% of the interface.",
    steps: ["0", "50", "100", "150", "200", "300", "400", "500", "600", "700", "800", "850", "900", "950", "990"].map(
      (s) => `--slate-${s}`
    ),
  },
  {
    name: "Sap — growth / success",
    note: "Very sparing — success, the xylem nod.",
    steps: ["300", "400", "500", "600", "700"].map((s) => `--sap-${s}`),
  },
  {
    name: "Status",
    note: "Warning & danger. Rare.",
    steps: ["--amber-500", "--amber-600", "--rose-500", "--rose-600", "--star"],
  },
];

const SEMANTIC = [
  "--bg",
  "--surface",
  "--surface-2",
  "--border",
  "--border-strong",
  "--text",
  "--text-muted",
  "--text-subtle",
  "--accent",
  "--accent-hover",
  "--accent-soft",
  "--link",
  "--secondary",
  "--success",
  "--warning",
  "--danger",
  "--code-bg",
  "--code-text",
];

export default function ColorPalettePage() {
  return (
    <div className="page">
      <div className="eyebrow">Foundations</div>
      <h1
        className="mt-3"
        style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-tighter)", color: "var(--text)" }}
      >
        Color palette
      </h1>
      <p
        className="mt-2.5"
        style={{ maxWidth: "var(--width-prose)", fontSize: "var(--text-md)", lineHeight: "var(--lh-relaxed)", color: "var(--text-muted)" }}
      >
        The Signal palette — cool slate neutrals with a teal-cyan accent. Click any swatch to copy
        its hex. Semantic tokens resolve per theme, so flip light/dark to see them shift.
      </p>

      {RAMPS.map((ramp) => (
        <section key={ramp.name} className="mt-[var(--space-10)]">
          <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-tight)", color: "var(--text)" }}>
            {ramp.name}
          </h2>
          <p className="mb-[var(--space-4)] mt-1" style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
            {ramp.note}
          </p>
          <div className="grid gap-[var(--space-3)]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))" }}>
            {ramp.steps.map((token) => (
              <ColorSwatch key={token} token={token} big />
            ))}
          </div>
        </section>
      ))}

      <section className="mt-[var(--space-12)]">
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-tight)", color: "var(--text)" }}>
          Semantic tokens
        </h2>
        <p className="mb-[var(--space-4)] mt-1" style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          Consume these in product code — not the raw ramps. They re-resolve per theme.
        </p>
        <div className="grid gap-[var(--space-3)]" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
          {SEMANTIC.map((token) => (
            <ColorSwatch key={token} token={token} />
          ))}
        </div>
      </section>
    </div>
  );
}
