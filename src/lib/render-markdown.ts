import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";

// rehype-sanitize strips class/style by default, which would kill shiki's
// injected colors — widen it to keep those on the elements shiki decorates,
// plus `loading` on img (READMEs hand-author it for lazy-loading screenshots).
const sanitizeSchema: SanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    span: [...(defaultSchema.attributes?.span ?? []), "className", "style"],
    code: [...(defaultSchema.attributes?.code ?? []), "className", "style"],
    pre: [...(defaultSchema.attributes?.pre ?? []), "className", "style"],
    div: [...(defaultSchema.attributes?.div ?? []), "className", "style"],
    img: [...(defaultSchema.attributes?.img ?? []), "loading"],
  },
};

// rehype-raw parses the raw HTML READMEs mix into markdown (`<div align>`,
// `<img>`, badges) back into the tree; sanitize runs before shiki so shiki's
// own trusted output is never stripped.
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
          const existingClass = typeof node.properties.class === "string" ? node.properties.class : "";
          node.properties.class = `${existingClass} codeblock-highlighted readme-code`.trim();
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
