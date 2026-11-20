/** Official Next.js draft-mode cookie. The edge worker routes on this name. */
export const DRAFT_MODE_COOKIE = "__prerender_bypass";

/** Official Tina editorial-workflow cookie used as the `x-branch` fetch header. */
export const TINA_BRANCH_COOKIE = "x-branch";

export const isPreviewServer = process.env.XYLEM_PREVIEW === "1";

export type PreviewContext = {
  enabled: boolean;
  branch: string | null;
};

export type TinaBranchCookieOptions = {
  path: "/";
  httpOnly: true;
  sameSite: "none" | "lax";
  secure: boolean;
};

/**
 * Same flags as Next.js production draft mode: Path=/, HttpOnly, Secure,
 * SameSite=None. Lax would be omitted from admin iframe subnavigations.
 */
export function tinaBranchCookieOptions(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): TinaBranchCookieOptions {
  const isProd = nodeEnv !== "development";
  return {
    path: "/",
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  };
}

/** True for a top-level document navigation (Tina's "View Preview" button). */
export function isDocumentNavigationRequest(headers: {
  get(name: string): string | null;
}): boolean {
  const mode = (headers.get("sec-fetch-mode") || "").toLowerCase();
  const dest = (headers.get("sec-fetch-dest") || "").toLowerCase();
  return mode === "navigate" || dest === "document";
}

export function previewContextFromEnvAndCookies(options: {
  previewServer: boolean;
  draftModeEnabled: boolean;
  branch: string | null;
}): PreviewContext {
  if (!options.previewServer || !options.draftModeEnabled) {
    return { enabled: false, branch: null };
  }
  const branch = options.branch?.trim() || null;
  return { enabled: true, branch };
}

export function tinaFetchOptions(branch: string | null | undefined) {
  if (!branch) return undefined;
  return {
    fetchOptions: {
      headers: { "x-branch": branch },
    },
  };
}
