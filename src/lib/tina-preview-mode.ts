import { postRelativePath } from "./tina-preview-path";
import { headingsFromBody, textFromNode } from "../components/tina/post-markdown-body";
import type { PostMeta } from "./tina-helpers";
import type { TinaMarkdownContent } from "tinacms/dist/rich-text";
import GithubSlugger from "github-slugger";
import readingTime from "reading-time";
import {
  isPreviewServer,
  pickFilesystemOrTinaPost,
  previewContextFromEnvAndCookies,
  TINA_BRANCH_COOKIE,
  type PreviewContext,
} from "./tina-preview-mode-core";

export {
  DRAFT_MODE_COOKIE,
  TINA_BRANCH_COOKIE,
  decodeBranchName,
  isPreviewServer,
  isDocumentNavigationRequest,
  previewContextFromEnvAndCookies,
  tinaBranchCookieOptions,
  pickFilesystemOrTinaPost,
  tinaFetchOptions,
  type PreviewContext,
  type TinaBranchCookieOptions,
} from "./tina-preview-mode-core";

/**
 * Draft-mode + branch cookie. Returns a disabled context on the GitHub Pages
 * static export (XYLEM_PREVIEW is unset), so this module can be imported
 * without calling Next dynamic APIs during `output: "export"`.
 */
export async function getPreviewContext(): Promise<PreviewContext> {
  if (!isPreviewServer()) {
    return { enabled: false, branch: null };
  }
  const { cookies, draftMode } = await import("next/headers");
  const { isEnabled } = await draftMode();
  const branch = (await cookies()).get(TINA_BRANCH_COOKIE)?.value ?? null;
  return previewContextFromEnvAndCookies({
    previewServer: true,
    draftModeEnabled: isEnabled,
    branch,
  });
}

type TinaPostFields = {
  title?: string | null;
  date?: string | null;
  lastmod?: string | null;
  summary?: string | null;
  canonicalUrl?: string | null;
  tags?: (string | null)[] | null;
  body?: TinaMarkdownContent | null;
};

export function metaFromTinaPost(
  post: TinaPostFields,
  slug: string,
): { meta: PostMeta; content: string } {
  const title = post.title?.trim() || "Untitled";
  const body = post.body;
  const bodyText = textFromNode(body ?? undefined);
  const reading = readingTime(bodyText || title || "preview");
  const meta: PostMeta = {
    title,
    date: post.date || new Date().toISOString(),
    tags: (post.tags ?? []).filter((tag): tag is string => Boolean(tag)),
    lastmod: post.lastmod || undefined,
    summary: post.summary || undefined,
    canonicalUrl: post.canonicalUrl || undefined,
    slug,
    readingTime: { text: reading.text, minutes: Math.ceil(reading.minutes) },
  };
  return { meta, content: bodyText };
}

export function postFromFilesystemOrTina(
  filesystem: { meta: PostMeta; content: string } | null,
  preview: PreviewContext,
  tinaData: { data?: { post?: TinaPostFields | null } } | null,
  slug: string,
): { meta: PostMeta; content: string } | null {
  const tinaPost = tinaData?.data?.post
    ? metaFromTinaPost(tinaData.data.post, slug)
    : null;
  return pickFilesystemOrTinaPost(filesystem, preview.enabled, tinaPost);
}

export function previewHeadings(body: TinaMarkdownContent | null | undefined) {
  return headingsFromBody(body ?? undefined, new GithubSlugger());
}

export function relativePathForSlug(slugParts: string[]): string {
  return postRelativePath(slugParts.join("/"));
}
