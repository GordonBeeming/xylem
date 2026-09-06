import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "@shikijs/rehype";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";
import { Figure } from "@/components/prose/Figure";
import { YouTubeEmbed } from "@/components/prose/YouTubeEmbed";
import { Walkthrough, Step } from "@/components/prose/Walkthrough";
import { Callout } from "@/components/prose/Callout";
import { proseComponents } from "@/components/prose/prose-components";

/** MDX-only components, used via JSX in .mdx source rather than by rendered
 *  README HTML, layered on the shared prose tag handlers. */
export const mdxComponents = {
  ...proseComponents,
  Figure,
  YouTubeEmbed,
  Walkthrough,
  Step,
  Callout,
};

/** One definition of the rendering pipeline, so a draft preview shows exactly
 *  what the published post will show. Shiki's meta string is carried through to
 *  a data-meta attribute, which is where CodeBlock reads a fence's title from. */
export const mdxOptions: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm, remarkMath],
    rehypePlugins: [
      rehypeSlug,
      rehypeKatex,
      [rehypeShiki, {
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
        addLanguageClass: true,
        parseMetaString: (metaString: string) => ({ __raw: metaString }),
        transformers: [{
          pre(node: { properties: Record<string, unknown> }) {
            const meta = (this as unknown as { options: { meta?: { __raw?: string } } }).options?.meta?.__raw;
            if (meta) {
              node.properties["data-meta"] = meta;
            }
          },
        }],
      }],
    ],
  },
};
