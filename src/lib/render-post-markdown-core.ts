/** MDX component tags used in post bodies. rehype-raw / parse5 lowercases
 *  them, so the Worker pipeline has to restore these names before
 *  rehype-react looks them up in mdxComponents. */
export const MDX_COMPONENT_NAMES = [
  "Figure",
  "YouTubeEmbed",
  "Walkthrough",
  "Step",
  "Callout",
] as const;

/** Numeric / boolean JSX attributes (`duration={860}`) rewritten to quoted
 *  HTML so rehype-raw can read them. */
export function normalizeJsxLiteralAttributes(source: string): string {
  return source.replace(
    /([A-Za-z_:][\w:-]*)=\{(\d+|true|false)\}/g,
    (_, name: string, value: string) => `${name}="${value}"`,
  );
}

/** HTML has no self-closing custom elements. `<Figure ... />` would be
 *  parsed as an opening tag and swallow the rest of the post. */
export function expandSelfClosingMdxTags(
  source: string,
  names: readonly string[] = MDX_COMPONENT_NAMES,
): string {
  const alt = names.map(escapeRegExp).join("|");
  return source.replace(
    new RegExp(`<(${alt})\\b([^>]*?)/>`, "g"),
    (_match, name: string, attrs: string) => `<${name}${attrs}></${name}>`,
  );
}

export function preprocessPostMarkdown(source: string): string {
  return expandSelfClosingMdxTags(normalizeJsxLiteralAttributes(source));
}

export function restoreMdxComponentTagName(
  tagName: string,
  properties?: Record<string, unknown> | null,
  names: readonly string[] = MDX_COMPONENT_NAMES,
): string {
  const restored = names.find((name) => name.toLowerCase() === tagName.toLowerCase());
  if (!restored || restored === tagName) return tagName;
  // `figure` is also a native HTML element. Only treat it as the MDX
  // <Figure> component when it carries the component's attributes.
  if (restored === "Figure") {
    const props = properties ?? {};
    if (!("src" in props || "caption" in props || "alt" in props)) {
      return tagName;
    }
  }
  return restored;
}

type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

/** rehype plugin: run after rehype-raw, before rehype-react. */
export function rehypeRestoreMdxComponentNames(
  names: readonly string[] = MDX_COMPONENT_NAMES,
) {
  return (tree: HastNode) => {
    walk(tree);
    function walk(node: HastNode) {
      if (node.type === "element" && typeof node.tagName === "string") {
        node.tagName = restoreMdxComponentTagName(node.tagName, node.properties, names);
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) walk(child);
      }
    }
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
