/**
 * Blog Figure images are stored as `/images/<file>` and live in
 * content/blog/<date>/images/ (copied flat to public/images at build).
 * Tina Cloud's media store prepends mediaRoot when converting a staging
 * URL back to a relative path. This helper also normalises leftover
 * `/uploads/...` values from the previous mediaRoot so a save cannot
 * rewrite an existing Figure src away from `/images/<file>`.
 */

const UPLOADS_PREFIX = /^\/?uploads\//i;

export function normalizeFigureImageSrc(value?: string | null): string {
  if (value == null) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:")) {
    return trimmed;
  }

  const path = trimmed.split(/[?#]/)[0];
  if (!UPLOADS_PREFIX.test(path.replace(/^\.\//, ""))) {
    return trimmed;
  }

  const withoutPrefix = path.replace(/^\.\//, "").replace(UPLOADS_PREFIX, "");
  const parts = withoutPrefix.split("/").filter(Boolean);
  const filename = parts[parts.length - 1];
  if (!filename || filename === "." || filename === "..") return trimmed;
  return `/images/${filename}`;
}
