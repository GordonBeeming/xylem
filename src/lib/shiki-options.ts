import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { bundledLanguages, createHighlighter, type BundledLanguage, type Highlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { Root } from "hast";
import { visit } from "unist-util-visit";

/**
 * Display options shared by post MDX and project READMEs.
 *
 * @shikijs/rehype 4.0.2's default plugin does not forward `engine` to
 * getSingletonHighlighter, so passing it there still boots Oniguruma WASM,
 * which workerd rejects ("Wasm code generation disallowed by embedder").
 * We create the highlighter ourselves with the JavaScript regex engine.
 */
export const shikiDisplayOptions = {
  themes: { light: "github-light", dark: "github-dark" } as const,
  defaultColor: false as const,
  addLanguageClass: true,
  parseMetaString: (metaString: string) => ({ __raw: metaString }),
  transformers: [
    {
      pre(node: { properties: Record<string, unknown> }) {
        const meta = (
          this as unknown as { options: { meta?: { __raw?: string } } }
        ).options?.meta?.__raw;
        if (meta) {
          node.properties["data-meta"] = meta;
        }
      },
    },
  ],
};

const highlighterPromise = createHighlighter({
  engine: createJavaScriptRegexEngine({ forgiving: true }),
  themes: ["github-light", "github-dark"],
  // Languages are loaded on demand from the code fences in each document.
  // Booting all bundled languages on a Cloudflare Worker isolate is too slow.
  langs: [],
});

const loadedLanguages = new Set<string>();
const languageLoads = new Map<string, Promise<void>>();

export function languageFromClassName(className: unknown): string | null {
  const classes = Array.isArray(className)
    ? className.map((value) => String(value))
    : typeof className === "string"
      ? className.split(/\s+/)
      : [];
  for (const classValue of classes) {
    const match = /^(?:language-|lang-)(.+)$/i.exec(classValue);
    if (match) return match[1] ?? null;
  }
  return null;
}

export function resolveBundledLanguageId(lang: string | null | undefined): string | null {
  const trimmed = lang?.trim() ?? "";
  if (!trimmed) return null;
  if (trimmed in bundledLanguages) return trimmed;
  const lower = trimmed.toLowerCase();
  if (lower in bundledLanguages) return lower;
  return null;
}

export function collectCodeBlockLanguages(tree: Root): string[] {
  const langs = new Set<string>();
  visit(tree, "element", (node) => {
    if (node.tagName !== "code" && node.tagName !== "pre") return;
    const properties = node.properties ?? {};
    const fromClass = languageFromClassName(properties.className);
    const fromLang =
      typeof properties.lang === "string"
        ? properties.lang
        : typeof properties.language === "string"
          ? properties.language
          : null;
    const lang = fromClass ?? fromLang;
    if (lang) langs.add(lang);
  });
  return [...langs];
}

export async function ensureHighlighterLanguages(
  highlighter: Highlighter,
  langs: readonly string[],
): Promise<void> {
  const unique = [...new Set(langs.map((lang) => resolveBundledLanguageId(lang)).filter((id): id is string => Boolean(id)))];
  await Promise.all(unique.map((id) => loadHighlighterLanguage(highlighter, id)));
}

function loadHighlighterLanguage(highlighter: Highlighter, id: string): Promise<void> {
  if (loadedLanguages.has(id)) return Promise.resolve();
  const existing = languageLoads.get(id);
  if (existing) return existing;
  const load = highlighter
    .loadLanguage(id as BundledLanguage)
    .then(() => {
      loadedLanguages.add(id);
    })
    .finally(() => {
      languageLoads.delete(id);
    });
  languageLoads.set(id, load);
  return load;
}

type TreeHandler = ReturnType<typeof rehypeShikiFromHighlighter>;
let treeHandler: TreeHandler | undefined;

/** Rehype plugin: highlight code with a workerd-safe Shiki engine. */
export function rehypeShikiJs() {
  return async (...args: Parameters<TreeHandler>) => {
    const tree = args[0];
    const highlighter = await highlighterPromise;
    await ensureHighlighterLanguages(highlighter, collectCodeBlockLanguages(tree));
    const handler =
      treeHandler ??
      (treeHandler = rehypeShikiFromHighlighter(
        highlighter,
        shikiDisplayOptions,
      ));
    return handler(...args);
  };
}
