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
 *
 * Client.getBranch() returns encodeURIComponent(name). Always decode
 * before putting the branch in the enter URL or the x-branch cookie.
 * On branch:change, call enter again (not only change-branch) and reload
 * already-mounted preview iframes: change-branch 401s if enter has not
 * finished, and a 404 iframe mounted before the cookie exists will not
 * pick the cookie up on its own.
 */

// Keep in sync with src/lib/tina-preview-mode-core.ts. This file is also
// loaded by the Node test runner, which cannot resolve extensionless
// cross-folder TypeScript imports.
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

export const TINA_CURRENT_BRANCH_STORAGE_KEY = "tinacms-current-branch";

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

export type BranchChangeEvent = { branchName?: string };

export type TinaCMSLike = {
  api?: { tina?: TinaApiClient };
  events?: {
    subscribe: (
      event: string,
      handler: (event: BranchChangeEvent) => void,
    ) => unknown;
  };
};

export function draftModeEnterUrl(branch?: string | null): string {
  const params = new URLSearchParams();
  const trimmed = decodeBranchName(branch);
  if (trimmed) params.set("branch", trimmed);
  params.set("slug", "/");
  return `/api/preview/enter?${params}`;
}

export function draftModeChangeBranchUrl(branch: string): string {
  return `/api/preview/change-branch?branch=${encodeURIComponent(decodeBranchName(branch))}`;
}

export function branchFromTinaClient(tina: TinaApiClient | undefined): string {
  if (!tina) return "";
  if (typeof tina.getBranch === "function") {
    return decodeBranchName(tina.getBranch());
  }
  return decodeBranchName(tina.branch);
}

export function storedTinaBranch(
  storage: Pick<Storage, "getItem"> | null | undefined = typeof window !== "undefined"
    ? window.localStorage
    : undefined,
): string {
  if (!storage) return "";
  try {
    return decodeBranchName(storage.getItem(TINA_CURRENT_BRANCH_STORAGE_KEY));
  } catch {
    return "";
  }
}

export function branchForDraftMode(
  tina?: TinaApiClient,
  override?: string | null,
  storage?: Pick<Storage, "getItem"> | null,
): string {
  return (
    decodeBranchName(override) ||
    branchFromTinaClient(tina) ||
    storedTinaBranch(storage)
  );
}

export function tinaFetchWithToken(
  tina: TinaApiClient | undefined,
): TinaAuthProvider["fetchWithToken"] | undefined {
  const authProvider = tina?.authProvider;
  const fetchWithToken = authProvider?.fetchWithToken;
  if (!authProvider || typeof fetchWithToken !== "function") return undefined;
  return fetchWithToken.bind(authProvider);
}

export async function enterTinaDraftMode(
  cms: TinaCMSLike,
  branchName?: string | null,
  storage?: Pick<Storage, "getItem"> | null,
): Promise<boolean> {
  const tina = cms.api?.tina;
  const fetchWithToken = tinaFetchWithToken(tina);
  if (!fetchWithToken) return false;
  const token = await tina?.authProvider?.getToken?.();
  if (!token?.id_token && !token?.access_token) return false;
  const response = await fetchWithToken(
    draftModeEnterUrl(branchForDraftMode(tina, branchName, storage)),
  );
  return Boolean(response?.ok);
}

export async function changeTinaDraftBranch(
  cms: TinaCMSLike,
  branchName: string,
): Promise<boolean> {
  const branch = decodeBranchName(branchName);
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

export type BindTinaDraftModeOptions = {
  runtime?: boolean;
  reload?: () => number;
};

/**
 * Official draft-mode hooks for cmsCallback: enter on every signed-in
 * admin load, on cms:login, and on branch:change (with the event's raw
 * branch name), then reload already-mounted preview iframes. Enters are
 * serialized so a branch switch does not race a still-in-flight first
 * enter and 401.
 */
export function bindTinaDraftModeHooks(
  cms: TinaCMSLike,
  options: BindTinaDraftModeOptions = {},
): { enter: (branch?: string | null) => Promise<boolean> } {
  const runtime = options.runtime ?? typeof window !== "undefined";
  const reload = options.reload ?? (() => reloadSameOriginPreviewIframes());
  let chain: Promise<boolean> = Promise.resolve(false);
  const enter = (branch?: string | null) => {
    const run = async () => {
      const ok = await enterTinaDraftMode(cms, branch);
      if (ok) reload();
      return ok;
    };
    chain = chain.then(run, run);
    return chain;
  };
  if (runtime) {
    void enter();
    cms.events?.subscribe("cms:login", () => {
      void enter();
    });
  }
  cms.events?.subscribe("branch:change", (event: BranchChangeEvent) => {
    const branch = decodeBranchName(event?.branchName);
    if (!branch) return;
    void enter(branch);
  });
  return { enter };
}
