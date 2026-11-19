/**
 * Filename helpers for the Tina `post` collection.
 *
 * New posts must land at `content/blog/<YYYY-MM-DD>/<slug>.mdx`, matching
 * existing content. The date is the post's `date` field when present,
 * otherwise today's date, both interpreted in Australia/Brisbane.
 */

const BRISBANE = "Australia/Brisbane";

export function slugifyTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`´"“”]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function postDateFolder(
  date: string | Date | null | undefined,
  now = new Date(),
): string {
  const parsed = date === null || date === undefined || date === ""
    ? now
    : new Date(date);
  const source = Number.isNaN(parsed.getTime()) ? now : parsed;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRISBANE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(source);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function postFilename(
  values: { title?: unknown; date?: unknown },
  now = new Date(),
): string {
  const title = typeof values.title === "string" ? values.title : "";
  const date =
    values.date instanceof Date || typeof values.date === "string"
      ? values.date
      : undefined;
  const slug = slugifyTitle(title) || "untitled";
  return `/${postDateFolder(date, now)}/${slug}`;
}

/** Sanitize a filename as the editor types, keeping typable separators. */
export function parsePostFilename(filename: string): string {
  const value = filename
    .trim()
    .replace(/^\/+/, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`´"“”]/g, "")
    .replace(/[^a-z0-9/-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/\/{2,}/g, "/");
  return value ? `/${value}` : "/";
}
