import client from "../../../tina/__generated__/client";

/**
 * The generated Tina GraphQL client, re-exported from a stable `@/` path so
 * pages don't have to recompute the relative depth to `tina/__generated__`.
 */
export const tinaClient = client;

// The Tina server is legitimately absent during the static export and a plain
// `pnpm dev`, and every page fetch would then log the same connection error.
// Warn once per process for that expected case; a real misconfig (bad query,
// schema error) is a different failure and is always logged in full below.
let warnedServerUnreachable = false;

/** A failed `fetch` to :4001 — the "Tina server isn't running" case, expected
 *  outside `pnpm dev:tina`, as opposed to a query/schema error worth surfacing. */
function isServerUnreachable(error: unknown): boolean {
  if (error && typeof error === "object") {
    const code = (error as { cause?: { code?: string }; code?: string }).cause?.code
      ?? (error as { code?: string }).code;
    if (code === "ECONNREFUSED") return true;
  }
  return error instanceof TypeError && error.message === "fetch failed";
}

/**
 * Run a Tina client query and return the `{ query, variables, data }` triple
 * that `useTina` needs for form registration and live preview — or `null` when
 * the Tina GraphQL server isn't reachable, so callers fall back to the
 * filesystem render (the static site works with no Tina server and no JS).
 */
export async function fetchTina<
  T extends { query: string; variables: object; data: object },
>(
  run: () => Promise<T>,
): Promise<{ query: string; variables: Record<string, unknown>; data: T["data"] } | null> {
  try {
    const result = await run();
    return {
      query: result.query,
      variables: result.variables as Record<string, unknown>,
      data: result.data,
    };
  } catch (error) {
    if (isServerUnreachable(error)) {
      if (!warnedServerUnreachable) {
        warnedServerUnreachable = true;
        console.warn(
          "[tina] Tina server not reachable on :4001 — rendering from the filesystem. This is expected during `pnpm build`/`pnpm dev`; run `pnpm dev:tina` for visual editing.",
        );
      }
    } else {
      // Unexpected (bad query, schema drift, …) — always surface it.
      console.error("[tina] Query failed; falling back to filesystem render.", error);
    }
    return null;
  }
}
