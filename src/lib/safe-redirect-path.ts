const SITE_ORIGIN = "https://gordonbeeming.com";

/**
 * A same-origin relative path safe to use as a post-exit redirect.
 * Rejects protocol-relative URLs, other origins, and missing values.
 */
export function safeRedirectPath(value: string | null | undefined): string {
  const raw = value?.trim() ?? "";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return "/";
  }
  try {
    const url = new URL(raw, SITE_ORIGIN);
    if (url.origin !== SITE_ORIGIN) return "/";
    const path = `${url.pathname}${url.search}${url.hash}`;
    if (!path.startsWith("/") || path.startsWith("//")) return "/";
    return path;
  } catch {
    return "/";
  }
}
