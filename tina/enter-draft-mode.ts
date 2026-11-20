/**
 * Enter Next.js draft mode from the Tina admin using the official
 * @tinacms/auth fetchWithToken helper on the auth provider.
 *
 * cms.api.tina is a Client and does not expose fetchWithToken itself —
 * only cms.api.tina.authProvider.fetchWithToken does (it adds the
 * Authorization header from the stored TinaCloud session). Calling the
 * missing Client method is a no-op, so an already-signed-in reload never
 * hits /api/preview/enter and the preview iframe never gets
 * __prerender_bypass.
 */

export type TinaAuthProvider = {
  fetchWithToken?: (input: string, init?: RequestInit) => Promise<Response>;
  getToken?: () => Promise<{
    id_token?: string | null;
    access_token?: string | null;
  }>;
};

export type TinaApiClient = {
  branch?: string;
  getBranch?: () => string;
  authProvider?: TinaAuthProvider;
};

export type TinaCMSLike = {
  api?: { tina?: TinaApiClient };
};

export function draftModeEnterUrl(branch?: string | null): string {
  const params = new URLSearchParams();
  const trimmed = branch?.trim();
  if (trimmed) params.set("branch", trimmed);
  params.set("slug", "/");
  return `/api/preview/enter?${params}`;
}

export function draftModeChangeBranchUrl(branch: string): string {
  return `/api/preview/change-branch?branch=${encodeURIComponent(branch)}`;
}

export function branchFromTinaClient(tina: TinaApiClient | undefined): string {
  if (!tina) return "";
  if (typeof tina.getBranch === "function") {
    return tina.getBranch()?.trim() || "";
  }
  return tina.branch?.trim() || "";
}

export function tinaFetchWithToken(
  tina: TinaApiClient | undefined,
): TinaAuthProvider["fetchWithToken"] | undefined {
  const fetchWithToken = tina?.authProvider?.fetchWithToken;
  if (typeof fetchWithToken !== "function") return undefined;
  return fetchWithToken.bind(tina.authProvider);
}

export async function enterTinaDraftMode(cms: TinaCMSLike): Promise<boolean> {
  const tina = cms.api?.tina;
  const fetchWithToken = tinaFetchWithToken(tina);
  if (!fetchWithToken) return false;
  const token = await tina?.authProvider?.getToken?.();
  if (!token?.id_token && !token?.access_token) return false;
  const response = await fetchWithToken(draftModeEnterUrl(branchFromTinaClient(tina)));
  return Boolean(response?.ok);
}

export async function changeTinaDraftBranch(
  cms: TinaCMSLike,
  branchName: string,
): Promise<boolean> {
  const branch = branchName.trim();
  if (!branch) return false;
  const fetchWithToken = tinaFetchWithToken(cms.api?.tina);
  if (!fetchWithToken) return false;
  const response = await fetchWithToken(draftModeChangeBranchUrl(branch));
  return Boolean(response?.ok);
}

/**
 * After enter returns Set-Cookie, reload any already-mounted visual-editor
 * preview iframe so the next navigation sends __prerender_bypass. If the
 * iframe has not been created yet, the later navigation will include the
 * cookie on its own.
 */
export function reloadSameOriginPreviewIframes(
  doc: Pick<Document, "querySelectorAll"> | null | undefined = typeof document !== "undefined" ? document : undefined,
  origin: string = typeof window !== "undefined" ? window.location.origin : "",
): number {
  if (!doc || !origin) return 0;
  let reloaded = 0;
  for (const frame of doc.querySelectorAll("iframe")) {
    const src = frame.getAttribute("src");
    if (!src) continue;
    let url: URL;
    try {
      url = new URL(src, origin);
    } catch {
      continue;
    }
    if (url.origin !== origin) continue;
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) continue;
    if (!url.pathname.startsWith("/blog/")) continue;
    frame.setAttribute("src", `${url.pathname}${url.search}`);
    reloaded += 1;
  }
  return reloaded;
}
