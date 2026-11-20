/**
 * Map Tina staging paths and leftover `/uploads` Figure srcs to the public
 * `/images/<file>` URL the preview app (and the static site) serve. The
 * preview Route Handler at /images/[filename] loads the file from the
 * editor branch when draft mode is on. Published pages are unchanged.
 */

const STAGING_MARKER = "/__staging/";
const FILE_MARKER = "/__file/";

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
