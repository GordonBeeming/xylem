// TinaCloud resolves every `type: "image"` field through its media CDN, turning
// a repo path like `/static/images/ssw-logo-light.png` into either
// `https://assets.tina.io/<clientId>/static/images/ssw-logo-light.png` or a
// staging URL such as
// `https://assets.tina.io/<clientId>/__staging/main/__file/static/images/ssw-logo-light.png`
// (the relative `/__staging/.../__file/...` form also appears after a first
// pass, and in some responses). Our images are committed repo files served
// same-origin (GitHub Pages), never uploaded to Tina media — so those CDN and
// staging URLs 404 on the built site. Restoring the original repo path is
// what actually serves the file. Local dev never produces these URLs (the
// filesystem fallback keeps raw paths), so this is a no-op there.

const CLIENT_ID = process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? "";

/** `/__staging/<branch>/__file/<repoPath>` — branch names may contain slashes. */
const STAGING_FILE = /^\/__staging\/.+?\/__file(\/[^?#]*)$/;

function stripTinaCloudPrefix(value: string, clientId: string): string {
  const cdnPrefix = clientId ? `https://assets.tina.io/${clientId}/` : "";
  if (cdnPrefix && value.startsWith(cdnPrefix)) {
    const path = value.slice(cdnPrefix.length);
    return path.startsWith("/") ? path : "/" + path;
  }
  return value;
}

function pathnameOfCompleteSrc(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      return new URL(trimmed).pathname;
    } catch {
      return null;
    }
  }
  if (trimmed.startsWith("/")) return trimmed.split(/[?#]/)[0];
  return null;
}

function repoPathFromStaging(value: string): string | null {
  const path = pathnameOfCompleteSrc(value);
  if (!path) return null;
  const match = path.match(STAGING_FILE);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/** A single field value: strip the TinaCloud media-CDN prefix and any
 *  `__staging/<branch>/__file` wrapper back to the same-origin repo path.
 *  Non-matching strings (foreign URLs, already-relative paths) pass through
 *  unchanged. */
export function normalizeTinaImageUrl(value: string, clientId = CLIENT_ID): string {
  const withoutCdn = stripTinaCloudPrefix(value, clientId);
  return repoPathFromStaging(withoutCdn) ?? withoutCdn;
}

function walk(value: unknown, clientId: string): unknown {
  if (typeof value === "string") return normalizeTinaImageUrl(value, clientId);
  if (Array.isArray(value)) return value.map((item) => walk(item, clientId));
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
        out[key] = key.startsWith("_") ? val : walk(val, clientId);
      }
      return out;
    }
  }
  return value;
}

/**
 * Rewrite every string leaf of a TinaCloud response through
 * {@link normalizeTinaImageUrl}, returning a deep-cloned copy with structure and
 * non-string leaves preserved — the lone `as T` is sound because the rewrite
 * only ever replaces a string with another string. Input is never mutated.
 */
export function normalizeTinaImages<T>(data: T, clientId = CLIENT_ID): T {
  return walk(data, clientId) as T;
}
