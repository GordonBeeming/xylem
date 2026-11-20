import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import { bundledLanguages, createHighlighter } from "shiki";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

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
  langs: Object.keys(bundledLanguages),
});

type TreeHandler = ReturnType<typeof rehypeShikiFromHighlighter>;
let treeHandler: TreeHandler | undefined;

/** Rehype plugin: highlight code with a workerd-safe Shiki engine. */
export function rehypeShikiJs() {
  return async (...args: Parameters<TreeHandler>) => {
    const handler =
      treeHandler ??
      (treeHandler = rehypeShikiFromHighlighter(
        await highlighterPromise,
        shikiDisplayOptions,
      ));
    return handler(...args);
  };
}
