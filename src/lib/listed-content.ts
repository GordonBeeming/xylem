import { cache } from "react";
import { getAllPosts, type PostMeta } from "@/lib/tina-helpers";

export { mergeFilesystemAndTinaPosts, postMetaFromTinaConnectionNode } from "@/lib/listed-content-core";

/**
 * Published posts from the filesystem, or the inlined snapshot on the
 * preview Worker. Rails, tag/year archives, and the blog index use this
 * list so a draft-mode session does not fetch every TinaCloud post on
 * each page click.
 *
 * An unpublished branch post is still reachable: resolveBlogPost() loads
 * that one document from TinaCloud when official draft mode is on, which
 * is what the Tina visual editor needs.
 */
export const getListedPosts = cache(async (): Promise<PostMeta[]> => {
  return getAllPosts();
});
