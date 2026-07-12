import { unified } from "unified";
import { visit } from "unist-util-visit";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import rehypeReact from "rehype-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import type { ReactElement } from "react";
import { proseComponents } from "@/components/prose/prose-components";

const CLOBBER_PREFIX = defaultSchema.clobberPrefix ?? "";

function normalizeAnchor(id: string): string {
  return id.replace(/-+/g, "-");
}

// rehype-sanitize's clobberPrefix rewrites every heading id to
// `<prefix><slug>`, but a README-authored in-page link (`href="#slug"`)
// still points at the unprefixed form. Blindly re-prefixing isn't enough
// though — GitHub's own TOC slugger can diverge from rehype-slug's
// (github-slugger) on punctuation-heavy headings, usually by a dash count
// (e.g. "Foo (Bar) (Baz)" — GitHub's TOC keeps a double dash where
// github-slugger collapses to one). So resolve against the real ids: exact
// match first, then a dash-collapsed match, but only when it's unambiguous.
function rehypeFixAnchorHashes() {
  return (tree: { type: string; children?: unknown[] }) => {
    const ids = new Set<string>();
    visit(tree, "element", (node: { properties?: Record<string, unknown> }) => {
      const id = node.properties?.id;
      if (typeof id === "string") ids.add(id);
    });

    visit(tree, "element", (node: { tagName?: string; properties?: Record<string, unknown> }) => {
      if (node.tagName !== "a" || !node.properties) return;
      const href = node.properties.href;
      if (typeof href !== "string" || !href.startsWith("#") || href.length <= 1) return;

      const stripped = href.startsWith(`#${CLOBBER_PREFIX}`) ? href.slice(1 + CLOBBER_PREFIX.length) : href.slice(1);
      const candidate = `${CLOBBER_PREFIX}${stripped}`;
      if (ids.has(candidate)) {
        node.properties.href = `#${candidate}`;
        return;
      }

      const normalizedCandidate = normalizeAnchor(candidate);
      const matches = [...ids].filter((id) => normalizeAnchor(id) === normalizedCandidate);
      if (matches.length === 1) {
        node.properties.href = `#${matches[0]}`;
      }
      // Otherwise leave the href as-is — genuinely unresolvable, don't guess.
    });
  };
}

// Sanitize runs before shiki in the pipeline below, so shiki's own output is
// added after sanitization and never touched by this schema — no widening
// needed for shiki's classes. The fence language reaches shiki + the
// CodeBlock header via the `language-*` className remark/rehype put on
// <code> before sanitize runs; defaultSchema already special-cases
// `className` on `code` to allow that pattern. proseComponents.img always
// forces `loading="lazy"` regardless of the source attribute, so there's
// nothing to widen for img either — defaultSchema is used as-is.

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
  .use(rehypeSanitize, defaultSchema)
  .use(rehypeFixAnchorHashes)
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
  // the raw <pre> (as a stringify-to-HTML pipeline would have needed).
  .use(rehypeReact, { Fragment, jsx, jsxs, components: proseComponents });

/** Render committed README markdown through the blog's prose component pipeline. */
export async function renderMarkdown(markdown: string): Promise<ReactElement> {
  const file = await processor.process(markdown);
  return file.result;
}
