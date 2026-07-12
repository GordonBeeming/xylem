import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import rehypeReact from "rehype-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import type { ReactElement } from "react";
import { proseComponents } from "@/components/prose/prose-components";

// Sanitize runs before shiki in the pipeline below, so shiki's own output is
// added after sanitization and never touched by this schema. The fence
// language reaches shiki + the CodeBlock header via the `language-*`
// className remark/rehype put on <code> before sanitize runs — rehype-sanitize's
// defaultSchema already special-cases `className` on `code` to allow that
// pattern, so no widening is needed there. Only `loading` on img (READMEs
// hand-author it for lazy-loading screenshots) is added here.
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
// rehypeSlug runs before rehypeSanitize (not after) so the heading ids it
// generates pass through the sanitizer's clobberPrefix — otherwise a heading
// whose slug collides with a DOM/window global would ship unprefixed.
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeShiki, {
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
    addLanguageClass: true,
    parseMetaString: (metaString: string) => {
      return { __raw: metaString };
    },
    transformers: [{
      pre(node: { properties: Record<string, unknown> }) {
        const meta = (this as unknown as { options: { meta?: { __raw?: string } } }).options?.meta?.__raw;
        if (meta) {
          node.properties["data-meta"] = meta;
        }
      },
    }],
  })
  // proseComponents supplies the CodeBlock/MermaidDiagram <pre> handler, so
  // the box chrome comes from those components rather than a CSS class on
  // the raw <pre> (as the old rehype-stringify pipeline needed).
  .use(rehypeReact, { Fragment, jsx, jsxs, components: proseComponents });

/** Render committed README markdown through the blog's prose component pipeline. */
export async function renderMarkdown(markdown: string): Promise<ReactElement> {
  const file = await processor.process(markdown);
  return file.result;
}
