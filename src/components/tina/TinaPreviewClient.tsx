"use client";

import { useSyncExternalStore } from "react";
import readingTime from "reading-time";
import { slug as slugify } from "github-slugger";
import { useTina, tinaField } from "tinacms/dist/react";
import { TinaMarkdown, type TinaMarkdownContent } from "tinacms/dist/rich-text";
import { PostLayout } from "@/layouts/PostLayout";
import { TinaPreviewMessage } from "@/components/tina/TinaPreviewMessage";
import { Figure } from "@/components/prose/Figure";
import { YouTubeEmbed } from "@/components/prose/YouTubeEmbed";
import { proseComponents } from "@/components/prose/prose-components";
import { normalizeTinaImages } from "@/components/tina/normalize-images";
import { postRelativePath } from "@/lib/tina-preview-path";
import type { HeadingEntry } from "@/lib/content";
import type { PostMeta, SiteConfig } from "@/lib/tina-helpers";
import { PostDocument } from "../../../tina/__generated__/types";

interface TinaPreviewClientProps {
  slug: string;
  siteConfig: SiteConfig;
  recentPosts: PostMeta[];
}

type PreviewPost = {
  __typename?: string;
  id?: string;
  title?: string | null;
  date?: string | null;
  tags?: (string | null)[] | null;
  lastmod?: string | null;
  summary?: string | null;
  canonicalUrl?: string | null;
  body?: TinaMarkdownContent;
  _sys?: {
    filename?: string;
    basename?: string;
    hasReferences?: boolean;
    breadcrumbs?: string[];
    path?: string;
    relativePath?: string;
    extension?: string;
  };
};

type PreviewData = { post: PreviewPost };

function placeholderData(slug: string): PreviewData {
  const relativePath = postRelativePath(slug);
  const breadcrumbs = slug.split("/");
  const filename = breadcrumbs[breadcrumbs.length - 1] ?? slug;
  return {
    post: {
      __typename: "Post",
      id: `content/blog/${relativePath}`,
      title: "",
      date: "",
      tags: [],
      lastmod: null,
      summary: null,
      canonicalUrl: null,
      body: { type: "root", children: [] },
      _sys: {
        filename,
        basename: filename,
        hasReferences: false,
        breadcrumbs,
        path: `content/blog/${relativePath}`,
        relativePath,
        extension: ".mdx",
      },
    },
  };
}

function textFromNode(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textFromNode).join("");
  if (typeof node === "object") {
    const value = node as { text?: unknown; children?: unknown };
    if (typeof value.text === "string") return value.text;
    return textFromNode(value.children);
  }
  return "";
}

function headingsFromBody(body: TinaMarkdownContent | undefined): HeadingEntry[] {
  const children = Array.isArray(body?.children) ? body.children : [];
  const headings: HeadingEntry[] = [];
  for (const node of children) {
    if (!node || typeof node !== "object") continue;
    const type = (node as { type?: string }).type;
    if (type !== "h2") continue;
    const text = textFromNode(node).trim();
    if (!text) continue;
    headings.push({ id: slugify(text), text });
  }
  return headings;
}

const markdownComponents = {
  ...proseComponents,
  Figure: (props: { src?: string; alt?: string; width?: string; height?: string; caption?: string }) => (
    <Figure
      src={props.src ?? ""}
      alt={props.alt ?? ""}
      width={props.width}
      height={props.height}
      caption={props.caption}
    />
  ),
  YouTubeEmbed: (props: { src?: string; title?: string }) => (
    <YouTubeEmbed src={props.src ?? ""} title={props.title} />
  ),
};

function isInEditorFrame(): boolean {
  return typeof window !== "undefined" && window.self !== window.top;
}

function emptySubscribe(): () => void {
  return () => {};
}

/**
 * Client preview of a post loaded through Tina's visual-editor iframe.
 *
 * The static site cannot emit pages that only exist on a branch, so this
 * component registers the same `post` query the admin uses and renders
 * whatever `useTina` receives from the parent frame. It does not call the
 * Tina content API and does not embed `TINA_TOKEN`.
 */
export function TinaPreviewClient({ slug, siteConfig, recentPosts }: TinaPreviewClientProps) {
  const relativePath = postRelativePath(slug);
  const { data } = useTina<PreviewData>({
    query: PostDocument,
    variables: { relativePath },
    data: placeholderData(slug),
  });
  const inEditor = useSyncExternalStore(
    emptySubscribe,
    isInEditorFrame,
    () => false,
  );

  const post = (normalizeTinaImages(data)?.post ?? {}) as PreviewPost;
  const title = post.title?.trim() ?? "";
  const body = post.body;
  const hasContent = title.length > 0 || textFromNode(body).trim().length > 0;
  const headings = headingsFromBody(body);
  const bodyText = textFromNode(body);
  const reading = readingTime(bodyText || title || "preview");

  if (!hasContent && !inEditor) {
    return (
      <TinaPreviewMessage title="This post is not on the live site yet">
        The production site is a static export, so a post that only exists on
        a branch has no page to open here. Use the visual editor in the Tina
        admin to preview it; the editor frame supplies the document.
      </TinaPreviewMessage>
    );
  }

  const meta: PostMeta = {
    title: title || "Untitled",
    date: post.date || new Date().toISOString(),
    tags: (post.tags ?? []).filter((tag): tag is string => Boolean(tag)),
    lastmod: post.lastmod ?? undefined,
    summary: post.summary ?? undefined,
    canonicalUrl: post.canonicalUrl ?? undefined,
    slug,
    readingTime: { text: reading.text, minutes: reading.minutes },
  };

  const tinaFields = {
    title: post.title ? tinaField(post, "title") : undefined,
    date: post.date ? tinaField(post, "date") : undefined,
    tags: post.tags ? tinaField(post, "tags") : undefined,
  };

  return (
    <>
      <div
        role="status"
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "var(--text-2xs)",
          letterSpacing: "var(--ls-wide)",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          background: "var(--surface-2)",
          borderBottom: "1px solid var(--border)",
          padding: "8px 16px",
          textAlign: "center",
        }}
      >
        Editor preview — this post is not on the live site yet
      </div>
      <PostLayout
        meta={meta}
        prevPost={null}
        nextPost={null}
        relatedPosts={[]}
        recentPosts={recentPosts.filter((item) => item.slug !== slug)}
        headings={headings}
        siteConfig={siteConfig}
        tinaFields={tinaFields}
      >
        {body ? <TinaMarkdown content={body} components={markdownComponents as never} /> : null}
      </PostLayout>
    </>
  );
}
