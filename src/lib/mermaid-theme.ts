// Color-bearing property keys in a mermaid `style`/`linkStyle`/`classDef`
// directive. `stroke-width` / `stroke-dasharray` are deliberately absent — they
// carry structure (border weight, dashes), not color, and must survive.
const COLOR_KEYS = new Set(["fill", "stroke", "color", "background", "background-color"]);

// Values that express structural intent rather than a concrete color. Preserving
// `none` keeps an intentionally invisible node (e.g. `fill:none,stroke:none`)
// invisible instead of letting the theme fill it in.
const PRESERVED_VALUES = new Set(["none", "transparent", "inherit"]);

const DIRECTIVE = /^(\s*)(style|linkStyle|classDef)\s+(\S+)\s+(.*)$/;

/**
 * Strip hardcoded colors from a mermaid chart's inline `style`/`linkStyle`/
 * `classDef` directives so the site's theme variables drive all coloring.
 *
 * Project READMEs (rendered from committed markdown) sometimes hardcode light
 * hex fills that clash with the dark site — this neutralizes those while leaving
 * structure (shapes, dashed borders, stroke widths, invisible nodes) intact.
 */
export function stripMermaidColors(chart: string): string {
  return chart
    .split("\n")
    .map((line) => {
      const match = DIRECTIVE.exec(line);
      if (!match) return line;

      const [, indent, keyword, target, propsPart] = match;

      // ponytail: props split on commas; a value containing its own comma
      // (rare, e.g. `stroke-dasharray: 5, 5`) would mis-split — swap in a real
      // tokenizer only if a README ever needs it.
      const kept = propsPart
        .split(",")
        .map((p) => p.trim())
        .filter((prop) => {
          const colonIdx = prop.indexOf(":");
          if (colonIdx === -1) return true; // not a key:value pair, leave it
          const key = prop.slice(0, colonIdx).trim().toLowerCase();
          const value = prop.slice(colonIdx + 1).trim().toLowerCase();
          if (!COLOR_KEYS.has(key)) return true;
          return PRESERVED_VALUES.has(value);
        });

      // All props were colors → the directive has nothing left to say, drop it.
      if (kept.length === 0) return null;

      return `${indent}${keyword} ${target} ${kept.join(",")}`;
    })
    .filter((line) => line !== null)
    .join("\n");
}
