import { cache } from "react";
import { fetchTina, tinaClient } from "@/components/tina/fetch";
import { getPost } from "@/lib/tina-helpers";
import {
  getPreviewContext,
  postFromFilesystemOrTina,
  relativePathForSlug,
  tinaFetchOptions,
} from "@/lib/tina-preview-mode";

/**
 * Filesystem first (published posts on this build), then the official Tina
 * Cloud query in draft mode with the x-branch cookie. Deduped with React
 * cache so generateMetadata and the page share one fetch.
 */
export const resolveBlogPost = cache(async (slug: string[]) => {
  const preview = await getPreviewContext();
  const tinaData = await fetchTina(() =>
    tinaClient.queries.post(
      { relativePath: relativePathForSlug(slug) },
      tinaFetchOptions(preview.enabled ? preview.branch : null),
    ),
  );
  return {
    preview,
    tinaData,
    result: postFromFilesystemOrTina(getPost(slug), preview, tinaData, slug.join("/")),
  };
});
