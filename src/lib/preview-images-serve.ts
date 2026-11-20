/** Path rules for serving `/images/<file>` on the preview app from the
 *  active branch. Production Pages still uses copy-images.mjs. */
export const PREVIEW_IMAGE_EXT = /\.(webp|png|jpe?g|gif|svg|avif|ico)$/i;

export function safeImageFilename(raw: string): string | null {
  let value = (raw ?? "").trim();
  if (!value) return null;
  try {
    value = decodeURIComponent(value);
  } catch {
    return null;
  }
  if (value.length > 200) return null;
  if (value.includes("/") || value.includes("\\") || value.includes("..")) return null;
  if (value.startsWith(".") || value.includes("\0")) return null;
  if (!PREVIEW_IMAGE_EXT.test(value)) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(value)) return null;
  return value;
}

export function isSafeGitBranch(branch: string | null | undefined): branch is string {
  if (!branch || branch.length > 200) return false;
  if (branch.includes("..") || branch.startsWith("/") || branch.endsWith("/")) return false;
  if (branch.split("/").some((part) => !part)) return false;
  return /^[A-Za-z0-9._/-]+$/.test(branch);
}

export function isAllowedRepoImagePath(repoPath: string, filename: string): boolean {
  const safeName = safeImageFilename(filename);
  if (!safeName) return false;
  if (!repoPath || repoPath.length > 500) return false;
  if (repoPath.includes("..") || repoPath.startsWith("/")) return false;
  if (repoPath.split("/").some((part) => !part || part === "." || part === "..")) return false;
  if (!PREVIEW_IMAGE_EXT.test(repoPath) || !/^[A-Za-z0-9._/-]+$/.test(repoPath)) return false;
  if (repoPath === `public/images/${safeName}`) return true;
  // content/blog/<date>/images/<file> or deeper date/title folders, never a repo walk.
  return new RegExp(
    `^content/blog/(?:[A-Za-z0-9._-]+/)*images/${escapeRegExp(safeName)}$`,
  ).test(repoPath);
}

/** Prefer a picker upload in public/images, otherwise the unique content/blog match. */
export function pickRepoImagePath(treePaths: string[], filename: string): string | null {
  const allowed = treePaths.filter((path) => isAllowedRepoImagePath(path, filename));
  const publicPath = allowed.find((path) => path === `public/images/${filename}`);
  if (publicPath) return publicPath;
  const content = allowed.filter((path) => path.startsWith("content/blog/")).sort();
  return content[0] ?? null;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
