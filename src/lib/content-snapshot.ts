import type { ContentSnapshot } from "./content-snapshot-types";
import { EMPTY_CONTENT_SNAPSHOT } from "./content-snapshot-types";
import snapshot from "./generated/content-snapshot.json";

/**
 * Inlined at build time by scripts/generate-content-snapshot.mjs so the
 * preview Worker does not have to `readFileSync` the `content/` tree.
 * OpenNext/workerd does not support those filesystem reads, which is why
 * a draft-mode session was serving empty lists.
 */
export function loadContentSnapshot(): ContentSnapshot | null {
  const data = snapshot as ContentSnapshot;
  if (
    !data ||
    (data.posts.length === 0 &&
      data.projects.length === 0 &&
      data.books.length === 0 &&
      data.nuggets.length === 0 &&
      !data.siteConfig)
  ) {
    return null;
  }
  return data;
}

export function snapshotOrEmpty(): ContentSnapshot {
  return loadContentSnapshot() ?? EMPTY_CONTENT_SNAPSHOT;
}
