"use client";

import { useTina, tinaField, useEditState } from "tinacms/dist/react";
import { TinaMarkdown, type TinaMarkdownContent } from "tinacms/dist/rich-text";
import GithubSlugger from "github-slugger";
import readingTime from "reading-time";
import type { ReactNode } from "react";
import { PostLayout } from "@/layouts/PostLayout";
import type { PostMeta, SiteConfig } from "@/lib/tina-helpers";
import type { HeadingEntry } from "@/lib/content";
import type { PostQuery } from "../../../../tina/__generated__/types";
import {
  headingsFromBody,
  postMarkdownComponents,
  shouldRenderLiveMarkdown,
  textFromNode,
} from "@/components/tina/post-markdown";
import { previewEditorBranch } from "@/lib/tina-preview-images";

interface LayoutProps {
  prevPost: PostMeta | null;
  nextPost: PostMeta | null;
  relatedPosts: PostMeta[];
  recentPosts: PostMeta[];
  headings: HeadingEntry[];
  siteConfig: SiteConfig;
}

interface ClientPostProps {
  query: string;
  variables: Record<string, unknown>;
  data: PostQuery;
  meta: PostMeta;
  layoutProps: LayoutProps;
  children: ReactNode;
}

/**
 * Client wrapper that drives the post from TinaCMS's live `useTina` data so
 * the preview updates as fields are edited in the admin, and tags each
 * editable header element with `data-tina-field` for click-to-edit.
 *
 * The body stays the server-rendered `MDXRemote` tree (`children`) for
 * visitors and for the static export. In Tina edit mode (`useEditState`),
 * the body is rendered from the live rich-text tree with TinaMarkdown and
 * the same prose components as the published post. `useTina().isClient` is
 * not used for that switch: it is true after any client hydration.
 *
 * Outside the admin, or when the Tina server is absent, this component
 * isn't rendered at all: the server component renders `PostLayout`
 * directly with filesystem data, so the static site works with no JS.
 */
export function ClientPost({ query, variables, data, meta, layoutProps, children }: ClientPostProps) {
  const { data: live } = useTina({ query, variables, data });
  const { edit } = useEditState();
  const post = live.post;
  const body = post.body as TinaMarkdownContent | undefined;
  const liveBody = shouldRenderLiveMarkdown(edit, body);
  const imageCtx = { slug: meta.slug, branch: previewEditorBranch() };
  const markdownComponents = postMarkdownComponents(new GithubSlugger(), imageCtx);
  const liveHeadings = liveBody
    ? headingsFromBody(body, new GithubSlugger())
    : layoutProps.headings;
  const reading = liveBody
    ? (() => {
        const rt = readingTime(textFromNode(body) || post.title || meta.title);
        return { text: rt.text, minutes: Math.ceil(rt.minutes) };
      })()
    : meta.readingTime;

  // Live edits overlaid on the server meta. readingTime/headings follow the
  // live body in edit mode; slug stays from `meta`.
  const mergedMeta: PostMeta = {
    ...meta,
    title: post.title,
    date: post.date,
    tags: (post.tags ?? []).filter((tag): tag is string => tag !== null),
    lastmod: post.lastmod ?? undefined,
    summary: post.summary ?? undefined,
    canonicalUrl: post.canonicalUrl ?? undefined,
    readingTime: reading,
  };

  const tinaFields = {
    title: tinaField(post, "title"),
    date: tinaField(post, "date"),
    tags: tinaField(post, "tags"),
  };

  return (
    <PostLayout
      meta={mergedMeta}
      tinaFields={tinaFields}
      {...layoutProps}
      headings={liveHeadings}
    >
      {liveBody ? (
        <TinaMarkdown content={body} components={markdownComponents as never} />
      ) : (
        children
      )}
    </PostLayout>
  );
}
