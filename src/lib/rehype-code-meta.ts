import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

/**
 * Rehype plugin that runs BEFORE shiki to stash the meta string
 * from code blocks onto a temporary property on the <pre> element.
 */
export function rehypeCodeMetaPre() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "pre") return;

      const codeEl = node.children.find(
        (child): child is Element =>
          child.type === "element" && child.tagName === "code"
      );
      if (!codeEl) return;

      const meta =
        (codeEl.data as Record<string, unknown>)?.meta ??
        (codeEl.properties?.metastring as string) ??
        "";

      if (meta) {
        // Stash on the node's data so it survives shiki's transform
        node.data = node.data ?? {};
        (node.data as Record<string, unknown>).__meta = String(meta);
      }
    });
  };
}

/**
 * Rehype plugin that runs AFTER shiki to restore the stashed meta string
 * as a data-meta attribute on the <pre> element.
 * Also copies data-language from shiki's output.
 */
export function rehypeCodeMetaPost() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "pre") return;

      // Restore meta from stashed data
      const stashedMeta = (node.data as Record<string, unknown>)?.__meta;
      if (stashedMeta) {
        node.properties = node.properties ?? {};
        node.properties["dataMeta"] = String(stashedMeta);
      }

      // Also ensure data-language is on <pre> from the child <code>
      const codeEl = node.children.find(
        (child): child is Element =>
          child.type === "element" && child.tagName === "code"
      );
      if (codeEl) {
        const lang = codeEl.properties?.["dataLanguage"] ?? codeEl.properties?.["data-language"];
        if (lang) {
          node.properties = node.properties ?? {};
          node.properties["dataLanguage"] = String(lang);
        }
      }
    });
  };
}
