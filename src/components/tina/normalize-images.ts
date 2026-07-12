// TinaCloud resolves every `type: "image"` field through its media CDN, turning
// a repo path like `/static/images/ssw-logo-light.png` into
// `https://assets.tina.io/<clientId>/static/images/ssw-logo-light.png`. Our
// images are committed repo files served same-origin (GitHub Pages), never
// uploaded to Tina media — so those CDN URLs 404 on the built site. Stripping
// the CDN prefix returns the field to its original same-origin path, which is
// what actually serves the file. Local dev never produces these URLs (the
// filesystem fallback keeps raw paths), so this is a no-op there.

const CLIENT_ID = process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? "";
const CDN_PREFIX = CLIENT_ID ? `https://assets.tina.io/${CLIENT_ID}/` : "";

/** A single field value: strip the TinaCloud media-CDN prefix back to the
 *  same-origin repo path. Non-matching strings (foreign URLs, already-relative
 *  paths) pass through unchanged. */
export function normalizeTinaImageUrl(value: string): string {
  if (CDN_PREFIX && value.startsWith(CDN_PREFIX)) {
    return "/" + value.slice(CDN_PREFIX.length);
  }
  return value;
}

function walk(value: unknown): unknown {
  if (typeof value === "string") return normalizeTinaImageUrl(value);
  if (Array.isArray(value)) return value.map(walk);
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) out[key] = walk(val);
    return out;
  }
  return value;
}

/**
 * Deep-clone a TinaCloud response, rewriting every string leaf through
 * {@link normalizeTinaImageUrl}. Structure and non-string leaves are preserved,
 * so the generic type is retained — the lone `as T` is sound because `walk`
 * only ever replaces a string with another string. Input is not mutated.
 */
export function normalizeTinaImages<T>(data: T): T {
  if (!CDN_PREFIX) return data;
  return walk(data) as T;
}
