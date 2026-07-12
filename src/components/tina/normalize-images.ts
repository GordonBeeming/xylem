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
    const path = value.slice(CDN_PREFIX.length);
    return path.startsWith("/") ? path : "/" + path;
  }
  return value;
}

function walk(value: unknown): unknown {
  if (typeof value === "string") return normalizeTinaImageUrl(value);
  if (Array.isArray(value)) return value.map(walk);
  // Only recurse into plain objects — the TinaCloud response is parsed JSON, so this
  // is always true in practice, but guarding the prototype stops a Date/RegExp/Map/Set
  // (or other non-plain object) from being silently flattened into `{}` if one ever
  // ends up in the tree.
  if (value !== null && typeof value === "object") {
    const proto = Object.getPrototypeOf(value);
    if (proto === null || proto === Object.prototype) {
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        // Tina's internal metadata (_sys, _values, __typename, __tina_metadata) has no
        // image fields, and `_values` duplicates the entire raw document — skip walking
        // it so normalization stays cheap.
        out[key] = key.startsWith("_") ? val : walk(val);
      }
      return out;
    }
  }
  return value;
}

/**
 * Rewrite every string leaf of a TinaCloud response through
 * {@link normalizeTinaImageUrl}, returning a deep-cloned copy with structure and
 * non-string leaves preserved — the lone `as T` is sound because `walk` only ever
 * replaces a string with another string. When no client ID is configured (local
 * dev, where these CDN URLs never appear) it short-circuits and returns the input
 * unchanged. Input is never mutated.
 */
export function normalizeTinaImages<T>(data: T): T {
  if (!CDN_PREFIX) return data;
  return walk(data) as T;
}
