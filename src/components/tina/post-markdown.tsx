import type { ReactNode } from "react";
import GithubSlugger from "github-slugger";
import { Figure } from "@/components/prose/Figure";
import { YouTubeEmbed } from "@/components/prose/YouTubeEmbed";
import { Walkthrough, Step } from "@/components/prose/Walkthrough";
import { Callout } from "@/components/prose/Callout";
import { proseComponents } from "@/components/prose/prose-components";
import { previewContentImageUrl } from "@/lib/tina-preview-images";
import { textFromReactNode } from "./post-markdown-body";

export type PostMarkdownImageCtx = { slug: string; branch?: string | null };

export {
  shouldRenderLiveMarkdown,
  textFromNode,
  textFromReactNode,
  headingsFromBody,
} from "./post-markdown-body";

export function postMarkdownComponents(
  slugger: GithubSlugger,
  imageCtx: PostMarkdownImageCtx,
) {
  return {
    ...proseComponents,
    h2: (props: { children?: ReactNode }) => {
      const text = textFromReactNode(props.children).trim();
      const id = text ? slugger.slug(text) : "";
      return proseComponents.h2({ ...props, id });
    },
    Figure: (props: {
      src?: string;
      alt?: string;
      width?: string;
      height?: string;
      caption?: string;
    }) => (
      <Figure
        src={previewContentImageUrl(props.src ?? "", imageCtx)}
        alt={props.alt ?? ""}
        width={props.width}
        height={props.height}
        caption={props.caption}
      />
    ),
    YouTubeEmbed: (props: { src?: string; title?: string }) => (
      <YouTubeEmbed src={props.src ?? ""} title={props.title} />
    ),
    Walkthrough,
    Step,
    Callout,
  };
}
