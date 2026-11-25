import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypeReact from "rehype-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import type { ReactElement } from "react";
import { mdxComponents } from "@/lib/mdx";
import { rehypeShikiJs } from "@/lib/shiki-options";
import {
  preprocessPostMarkdown,
  rehypeRestoreMdxComponentNames,
} from "@/lib/render-post-markdown-core";

/**
 * next-mdx-remote hydrates compiled MDX with `new Function`, which workerd
 * rejects ("Wasm code generation disallowed by embedder"). On the preview
 * Worker, render the post body through the same unified/rehype-react path
 * that already works for project READMEs.
 *
 * Posts can contain MDX component tags (`<Figure />`, `<YouTubeEmbed />`).
 * rehype-raw turns those into elements (HTML lowercases the tag names, and
 * a self-closing <Figure /> would otherwise swallow the rest of the post);
 * we expand and restore those tags so rehype-react can map them through
 * mdxComponents. Numeric JSX attributes (`duration={860}`) are rewritten
 * to quoted HTML so the parser can read them.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeRestoreMdxComponentNames)
  .use(rehypeSlug)
  .use(rehypeKatex)
  .use(rehypeShikiJs)
  .use(rehypeReact, { Fragment, jsx, jsxs, components: mdxComponents });

export async function renderPostMarkdown(source: string): Promise<ReactElement> {
  const file = await processor.process(preprocessPostMarkdown(source));
  return file.result;
}
