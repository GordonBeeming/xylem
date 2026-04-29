import { FEATURE_FLAGS, FEATURE_FLAG_STORAGE_PREFIX } from "@/lib/feature-flags";

/**
 * Inline script that reads feature flags from localStorage before React hydrates.
 * This prevents flash of wrong theme for CSS-class-based flags (e.g., SSW theme).
 */
export function FeatureFlagScript() {
  const cssFlags = FEATURE_FLAGS.filter((f) => f.cssClass);

  if (cssFlags.length === 0) return null;

  // Build a minimal inline script that checks localStorage and applies CSS classes
  const script = `(function(){try{var d=document.documentElement;${cssFlags
    .map(
      (f) =>
        `if(localStorage.getItem("${FEATURE_FLAG_STORAGE_PREFIX}${f.key}")==="true")d.classList.add("${f.cssClass}");`
    )
    .join("")}}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
