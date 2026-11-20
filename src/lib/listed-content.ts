import { cache } from "react";
import { fetchTina, tinaClient } from "@/components/tina/fetch";
import { getPreviewContext, tinaFetchOptions } from "@/lib/tina-preview-mode";
import { getAllPosts, type PostMeta } from "@/lib/tina-helpers";
import {
  mergeFilesystemAndTinaPosts,
  postMetaFromTinaConnectionNode,
} from "@/lib/listed-content-core";

export { mergeFilesystemAndTinaPosts, postMetaFromTinaConnectionNode } from "@/lib/listed-content-core";

/**
 * Filesystem (or the inlined snapshot on the preview Worker), plus Tina Cloud
 * documents on the draft-mode branch so unpublished posts appear in lists.
 */
export const getListedPosts = cache(async (): Promise<PostMeta[]> => {
  const filesystem = getAllPosts();
  const preview = await getPreviewContext();
  if (!preview.enabled) return filesystem;
  const tinaData = await fetchTina(() =>
    tinaClient.queries.postConnection(
      { first: 1000, sort: "date" },
      tinaFetchOptions(preview.branch),
    ),
  );
  const edges =
    tinaData?.data && "postConnection" in tinaData.data
      ? tinaData.data.postConnection?.edges ?? []
      : [];
  const fromTina = edges
    .map((edge) => (edge?.node ? postMetaFromTinaConnectionNode(edge.node) : null))
    .filter((post): post is PostMeta => Boolean(post));
  return mergeFilesystemAndTinaPosts(filesystem, fromTina);
});
