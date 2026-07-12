import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";

// Sanitize runs before shiki in the pipeline below, so shiki's own output is
// added after sanitization and never touched by this schema — widening it
// for span/code/pre/div class/style buys shiki nothing and only widens the
// injection surface for raw HTML mirrored in from READMEs. Only `loading` on
// img (READMEs hand-author it for lazy-loading screenshots) is needed here.
const sanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    img: [...(defaultSchema.attributes?.img ?? []), "loading"],
  },
};

// rehype-raw parses the raw HTML READMEs mix into markdown (`<div align>`,
// `<img>`, badges) back into the tree before sanitize runs.
//
// Shiki's dual-theme spans only carry `--shiki-light`/`--shiki-dark` CSS
// custom properties (defaultColor: false) — nothing consumes them without a
// class. The transformer below tags every <pre> with `codeblock-highlighted`
// (blog's color rule) and `readme-code` (box chrome, since README <pre>s
// have no CodeBlock.tsx wrapper to supply it) — both in tailwind.css.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeSlug)
  .use(rehypeShiki, {
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    addLanguageClass: true,
    transformers: [
      {
        pre(node: { properties: Record<string, unknown> }) {
          // codeblock-highlighted: reuses the blog's shiki color rule.
          // readme-code: box chrome (bg/border/padding) in tailwind.css —
          // README <pre>s have no CodeBlock.tsx wrapper div to supply it.
          // hast represents the class attribute as `className` (an array),
          // not `class` — writing the latter is silently ignored by rehype-stringify.
          const existing = node.properties.className;
          const classes = Array.isArray(existing)
            ? existing
            : typeof existing === "string"
              ? existing.split(" ")
              : [];
          node.properties.className = [...classes, "codeblock-highlighted", "readme-code"];
        },
      },
    ],
  })
  .use(rehypeStringify);

/** Render committed README markdown to an HTML string for `dangerouslySetInnerHTML`. */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}
