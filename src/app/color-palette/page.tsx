import type { Metadata } from "next";
import { ColorSwatch } from "./ColorSwatch";

export const metadata: Metadata = {
  title: "Color Palette",
  description:
    "The official brand colors for Gordon Beeming's blog, available in both light and dark mode variants.",
  openGraph: {
    title: "Color Palette | Gordon Beeming",
    description:
      "The official brand colors for Gordon Beeming's blog.",
  },
};

const lightModeColors = [
  {
    name: "Background",
    hex: "#F8F9FA",
    colorVar: "--color-surface-primary",
    description: "Main page background color",
  },
  {
    name: "Text",
    hex: "#1A1A1A",
    colorVar: "--color-text-primary",
    description: "Primary text color",
  },
  {
    name: "Secondary Text",
    hex: "#374151",
    colorVar: "--color-text-secondary",
    description:
      "Secondary text color for better contrast (WCAG AA compliant)",
  },
  {
    name: "Primary",
    hex: "#0063B2",
    colorVar: "--color-brand-primary",
    description: "Primary brand color for links and accents",
  },
  {
    name: "Accent",
    hex: "#0075A3",
    colorVar: "--color-brand-accent",
    description: "Blue accent color (WCAG AA compliant)",
  },
  {
    name: "Highlight",
    hex: "#46CBFF",
    colorVar: "--color-brand-highlight",
    description: "Bright highlight color for emphasis elements",
  },
  {
    name: "UI Accents",
    hex: "#E9ECEF",
    colorVar: "--color-surface-tertiary",
    description: "Borders, subtle backgrounds",
  },
];

const darkModeColors = [
  {
    name: "Background",
    hex: "#1A1A1A",
    colorVar: "--color-surface-primary",
    description: "Main page background color",
  },
  {
    name: "Text",
    hex: "#E0E0E0",
    colorVar: "--color-text-primary",
    description: "Primary text color",
  },
  {
    name: "Secondary Text",
    hex: "#D1D5DB",
    colorVar: "--color-text-secondary",
    description:
      "Secondary text color for better contrast (WCAG AA compliant)",
  },
  {
    name: "Primary",
    hex: "#46CBFF",
    colorVar: "--color-brand-primary",
    description: "Primary brand color for links and accents",
  },
  {
    name: "Accent",
    hex: "#0063B2",
    colorVar: "--color-brand-accent",
    description: "Dark blue accent color",
  },
  {
    name: "UI Accents",
    hex: "#2C2C2C",
    colorVar: "--color-surface-tertiary",
    description: "Borders, subtle backgrounds",
  },
];

export default function ColorPalettePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <div className="flex flex-col gap-10">
        {/* Header */}
        <div>
          <h1 className="mb-2 border-l-[3px] border-l-[#0063B2] pl-4 text-[30px] font-extrabold leading-tight text-[var(--color-text-primary)] md:text-4xl">
            My Color Palette
          </h1>
          <p className="mt-4 pl-[19px] text-lg text-[var(--color-text-secondary)]">
            The official brand colors for my blog, available in both light and
            dark mode variants. Click any swatch to copy its hex code.
          </p>
        </div>

        {/* Light Mode Section */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]">
            Light Mode
          </h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {lightModeColors.map((color) => (
              <ColorSwatch
                key={`light-${color.name}`}
                name={color.name}
                hex={color.hex}
                colorVar={color.colorVar}
                description={color.description}
              />
            ))}
          </div>
        </section>

        {/* Dark Mode Section */}
        <section>
          <h2 className="mb-6 text-2xl font-bold text-[var(--color-text-primary)]">
            Dark Mode
          </h2>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            {darkModeColors.map((color) => (
              <ColorSwatch
                key={`dark-${color.name}`}
                name={color.name}
                hex={color.hex}
                colorVar={color.colorVar}
                description={color.description}
              />
            ))}
          </div>
        </section>

        {/* Usage Notes */}
        <section className="rounded-xl bg-[var(--color-surface-secondary)] p-6 shadow-[var(--shadow-card)]">
          <h3 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
            Usage Notes
          </h3>
          <ul className="space-y-2 text-[var(--color-text-secondary)]">
            <li>
              These colors are defined as CSS custom properties in the site's
              stylesheet
            </li>
            <li>
              The theme automatically switches between light and dark variants
              based on user preference
            </li>
            <li>
              All colors meet WCAG 2.1 AA accessibility standards for contrast
              (4.5:1 minimum ratio)
            </li>
            <li>
              Secondary Text colors have been optimized for enhanced readability
              and accessibility
            </li>
            <li>
              Use Primary colors for interactive elements and branding
            </li>
            <li>
              Use Accent colors sparingly for highlights and call-to-action
              elements
            </li>
            <li>
              Secondary Text colors are ideal for metadata, captions, and
              supplementary information
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
