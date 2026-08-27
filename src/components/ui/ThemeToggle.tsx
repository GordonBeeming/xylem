"use client";

import { useTheme } from "next-themes";

const buttonClassName =
  "theme-toggle inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-md)] px-[var(--space-3)] transition-[var(--transition-colors)] hover:bg-[var(--surface-2)] hover:text-[color:var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent)]";

// `currentColor` + `color-mix` (rather than a border token) let this button
// sit on any surface — the dark nav band, the light mobile-drawer surface —
// and always render a border that reads as "35% of whatever the text color is".
const buttonStyle: React.CSSProperties = {
  color: "inherit",
  background: "transparent",
  border: "1px solid color-mix(in srgb, currentColor 35%, transparent)",
  cursor: "pointer",
};

// No `inline-flex` here on purpose — see the comment on ThemeToggle below.
const variantClassName = "items-center gap-[var(--space-2)]";
const labelClassName = "max-[720px]:hidden";
const labelStyle: React.CSSProperties = { fontFamily: "var(--font-ui)", fontSize: "var(--text-xs)" };

function MoonIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

/**
 * next-themes sets `class="dark"` on <html> from a blocking inline script,
 * before first paint — so the site is statically exported with no theme
 * context, but the DOM's theme class is already correct on the very first
 * frame. Rather than reading `resolvedTheme` in React (which is undefined
 * until after mount, and would need a mounted-guard + placeholder to avoid
 * a hydration mismatch), this renders both icon+label pairs unconditionally
 * and lets CSS pick the right one off the `.dark` class, in prose.css:
 *   .theme-toggle .i-moon { display: inline-flex; }
 *   .theme-toggle .i-sun  { display: none; }
 *   .dark .theme-toggle .i-moon { display: none; }
 *   .dark .theme-toggle .i-sun  { display: inline-flex; }
 * `display` for `.i-moon`/`.i-sun` has to come from those prose.css rules,
 * not a Tailwind utility on the span itself: tailwind.css imports prose.css
 * as `layer(components)`, which sits below Tailwind's utilities layer, so a
 * utility class always wins over a components-layer rule regardless of
 * selector specificity. An `inline-flex` utility on these spans would beat
 * `.dark .theme-toggle .i-sun { display: none }` and both icons would show
 * in every theme. `max-[720px]:hidden` on the labels below is fine as a
 * utility precisely because it only ever needs to win, never lose, to a
 * components-layer rule.
 * The click handler reads the same DOM class rather than component state,
 * so it is never out of sync with what is actually on screen.
 */
export function ThemeToggle() {
  const { setTheme } = useTheme();

  const handleClick = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Switch between light and dark theme"
      className={buttonClassName}
      style={buttonStyle}
    >
      <span className={`i-moon ${variantClassName}`}>
        <MoonIcon />
        <span className={labelClassName} style={labelStyle}>
          Dark theme
        </span>
      </span>
      <span className={`i-sun ${variantClassName}`}>
        <SunIcon />
        <span className={labelClassName} style={labelStyle}>
          Light theme
        </span>
      </span>
    </button>
  );
}
