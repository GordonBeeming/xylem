/** Official Next.js draft-mode cookie. The edge worker routes on this name. */
export const DRAFT_MODE_COOKIE = "__prerender_bypass";

/** Official Tina editorial-workflow cookie used as the `x-branch` fetch header. */
export const TINA_BRANCH_COOKIE = "x-branch";

/**
 * Tina's Client.getBranch() returns encodeURIComponent(name), and a leftover
 * cookie or query value may be encoded more than once. Decode to the raw
 * Git branch name before storing it or sending it as the x-branch header.
 */
export function decodeBranchName(branch?: string | null): string {
  const trimmed = branch?.trim() ?? "";
  if (!trimmed) return "";
  let current = trimmed;
  for (let i = 0; i < 3; i += 1) {
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch {
      break;
    }
  }
  return current;
}

/**
 * True on the OpenNext preview Worker. Must be read at call time, not as a
 * module-level const: Cloudflare populates process.env from wrangler vars
 * only after the first request, and Next does not inline this name unless
 * it is listed in `next.config.ts` `env`.
 */
export function isPreviewServer(
  env: { XYLEM_PREVIEW?: string } = process.env,
): boolean {
  return env.XYLEM_PREVIEW === "1";
}

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
  const branch = decodeBranchName(options.branch) || null;
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

/** Filesystem first; Tina Cloud only when draft mode is on and no file exists in this build. */
export function pickFilesystemOrTinaPost<T>(
  filesystem: T | null,
  previewEnabled: boolean,
  tinaPost: T | null | undefined,
): T | null {
  if (filesystem) return filesystem;
  if (previewEnabled && tinaPost) return tinaPost;
  return null;
}
