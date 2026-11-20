import type { ReactNode } from "react";
import GithubSlugger from "github-slugger";
import type { HeadingEntry } from "@/lib/content";
import type { TinaMarkdownContent } from "tinacms/dist/rich-text";

/**
 * Visitor (and static export) HTML keeps the server-rendered MDX body.
 * The live TinaMarkdown tree is only used when Tina edit mode is on
 * (`useEditState().edit`). `useTina().isClient` is not that flag: it
 * becomes true on every client hydration.
 */
export function shouldRenderLiveMarkdown(
  edit: boolean,
  body: TinaMarkdownContent | null | undefined,
): body is TinaMarkdownContent {
  return Boolean(edit && body);
}

export function textFromNode(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textFromNode).join("");
  if (typeof node === "object") {
    const value = node as { text?: unknown; children?: unknown };
    if (typeof value.text === "string") return value.text;
    return textFromNode(value.children);
  }
  return "";
}

export function textFromReactNode(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromReactNode).join("");
  if (typeof node === "object" && "props" in node) {
    return textFromReactNode((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

export function headingsFromBody(
  body: TinaMarkdownContent | undefined,
  slugger: GithubSlugger,
): HeadingEntry[] {
  const children = Array.isArray(body?.children) ? body.children : [];
  const headings: HeadingEntry[] = [];
  for (const node of children) {
    if (!node || typeof node !== "object") continue;
    const type = (node as { type?: string }).type;
    if (type !== "h2") continue;
    const text = textFromNode(node).trim();
    if (!text) continue;
    headings.push({ id: slugger.slug(text), text });
  }
  return headings;
}
