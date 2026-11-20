/** Official Next.js draft-mode cookie. The edge worker routes on this name. */
export const DRAFT_MODE_COOKIE = "__prerender_bypass";

/** Official Tina editorial-workflow cookie used as the `x-branch` fetch header. */
export const TINA_BRANCH_COOKIE = "x-branch";

export const isPreviewServer = process.env.XYLEM_PREVIEW === "1";

export type PreviewContext = {
  enabled: boolean;
  branch: string | null;
};

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
