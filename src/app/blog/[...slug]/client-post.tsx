"use client";

import { useTina, tinaField } from "tinacms/dist/react";
import type { ReactNode } from "react";
import { PostLayout } from "@/layouts/PostLayout";
import type { PostMeta, SiteConfig } from "@/lib/tina-helpers";
import type { HeadingEntry } from "@/lib/content";
import type { PostQuery } from "../../../../tina/__generated__/types";

interface LayoutProps {
  prevPost: PostMeta | null;
  nextPost: PostMeta | null;
  relatedPosts: PostMeta[];
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
 * Client wrapper that drives the post header from TinaCMS's live `useTina`
 * data so the preview updates as fields are edited in the admin, and tags each
 * editable element with `data-tina-field` for click-to-edit.
 *
 * The body stays server-rendered (`MDXRemote` is RSC-only and carries custom
 * MDX components) and is passed through as `children` — live body editing is a
 * follow-up that needs matching rich-text templates. Outside the admin, or when
 * the Tina server is absent, this component isn't rendered at all: the server
 * component renders `PostLayout` directly with filesystem data, so the static
 * site works with no JS.
 */
export function ClientPost({ query, variables, data, meta, layoutProps, children }: ClientPostProps) {
  const { data: live } = useTina({ query, variables, data });
  const post = live.post;

  // Live edits overlaid on the server meta. Only the header fields are live;
  // readingTime/slug come from the (static) body, so they stay from `meta`.
  const mergedMeta: PostMeta = {
    ...meta,
    title: post.title,
    date: post.date,
    tags: (post.tags ?? []).filter((tag): tag is string => tag !== null),
    lastmod: post.lastmod ?? undefined,
    summary: post.summary ?? undefined,
    canonicalUrl: post.canonicalUrl ?? undefined,
  };

  const tinaFields = {
    title: tinaField(post, "title"),
    date: tinaField(post, "date"),
    tags: tinaField(post, "tags"),
  };

  return (
    <PostLayout meta={mergedMeta} tinaFields={tinaFields} {...layoutProps}>
      {children}
    </PostLayout>
  );
}
