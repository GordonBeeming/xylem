/**
 * Unpublished posts keep images in content/blog/<date>/images/ and only copy
 * them to /images at build. Tina's editorial workflow rewrites type:image
 * fields on a branch to `/__staging/<branch>/__file/images/<file>`, which
 * 404s on this static site. In the visual-editor preview only, map those
 * (and leftover /images/<file> paths) to a same-origin worker proxy that
 * fetches the file from the branch. Published pages are unchanged.
 */

const PREVIEW_PREFIX = "/__preview-content";
const STAGING_MARKER = "/__staging/";
const FILE_MARKER = "/__file/";
const BRANCH_STORAGE_KEY = "tinacms-current-branch";

export function contentImagesFolder(slug: string): string {
  const parts = slug.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const dir = parts.length >= 2 ? parts.slice(0, -1).join("/") : "";
  return dir ? `content/blog/${dir}/images` : "content/blog/images";
}

export function parseTinaStagingPath(
  src: string,
): { branch: string; repoPath: string } | null {
  const url = src.trim();
  const start = url.indexOf(STAGING_MARKER);
  if (start === -1) return null;
  const fileAt = url.indexOf(FILE_MARKER, start);
  if (fileAt === -1) return null;
  const branch = safeDecode(url.slice(start + STAGING_MARKER.length, fileAt));
  const repoPath = safeDecode(url.slice(fileAt + FILE_MARKER.length).split(/[?#]/)[0]);
  if (!branch || !repoPath) return null;
  return { branch, repoPath };
}

export function isPublicImagesPath(src: string): boolean {
  const path = pathnameOf(src);
  return path !== null && /^\/images\/[^/]+$/.test(path);
}

/** `/images/<file>` plus leftover `/uploads/images/<file>` or `/uploads/<file>`. */
export function publicImagesFilename(src: string): string {
  const path = pathnameOf(src);
  if (!path) return "";
  if (/^\/images\/[^/]+$/.test(path)) return basename(path);
  const uploads = path.match(/^\/uploads\/(?:images\/)?([^/]+)$/);
  return uploads ? uploads[1] : "";
}

/** Map Tina staging, leftover /uploads, and /images srcs to `/images/<file>`. */
export function publicPreviewImageSrc(src: string): string {
  if (!src) return src;
  const staging = parseTinaStagingPath(src);
  const filename = staging
    ? basename(staging.repoPath)
    : publicImagesFilename(src);
  return filename ? `/images/${filename}` : src;
}

export function previewEditorBranch(): string | null {
  if (typeof window === "undefined") return null;
  const fromQuery = new URLSearchParams(window.location.search).get("branch");
  if (fromQuery) return fromQuery;
  try {
    return window.localStorage.getItem(BRANCH_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function previewContentImageUrl(
  src: string,
  ctx: { slug: string; branch?: string | null },
): string {
  if (!src) return src;
  const staging = parseTinaStagingPath(src);
  const filename = staging
    ? basename(staging.repoPath)
    : publicImagesFilename(src);
  const branch = staging?.branch || ctx.branch || null;
  if (!filename || !branch) return src;
  const folder = contentImagesFolder(ctx.slug);
  return `${PREVIEW_PREFIX}/${branch}${FILE_MARKER}${folder}/${encodeURIComponent(filename)}`;
}

export function rewritePreviewImageData<T>(
  data: T,
  ctx: { slug: string; branch?: string | null },
): T {
  return walk(data, ctx) as T;
}

function walk(value: unknown, ctx: { slug: string; branch?: string | null }): unknown {
  if (typeof value === "string") return previewContentImageUrl(value, ctx);
  if (Array.isArray(value)) return value.map((item) => walk(item, ctx));
  if (value !== null && typeof value === "object") {
    const proto = Object.getPrototypeOf(value);
    if (proto === null || proto === Object.prototype) {
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        out[key] = key.startsWith("_") ? val : walk(val, ctx);
      }
      return out;
    }
  }
  return value;
}

function pathnameOf(src: string): string | null {
  const trimmed = src.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      return new URL(trimmed).pathname;
    } catch {
      return null;
    }
  }
  return trimmed.split(/[?#]/)[0];
}

function basename(path: string): string {
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
