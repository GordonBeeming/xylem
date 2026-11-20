import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  branchFromTinaClient,
  changeTinaDraftBranch,
  draftModeChangeBranchUrl,
  draftModeEnterUrl,
  enterTinaDraftMode,
  reloadSameOriginPreviewIframes,
  tinaFetchWithToken,
} from "./enter-draft-mode.ts";

describe("draftModeEnterUrl", () => {
  it("always includes a same-origin slug and the branch when present", () => {
    assert.equal(draftModeEnterUrl("gb/tina-preview-test"), "/api/preview/enter?branch=gb%2Ftina-preview-test&slug=%2F");
    assert.equal(draftModeEnterUrl(""), "/api/preview/enter?slug=%2F");
    assert.equal(draftModeEnterUrl(null), "/api/preview/enter?slug=%2F");
  });
});

describe("draftModeChangeBranchUrl", () => {
  it("encodes a slashed branch name", () => {
    assert.equal(
      draftModeChangeBranchUrl("gb/tina-preview-test"),
      "/api/preview/change-branch?branch=gb%2Ftina-preview-test",
    );
  });
});

describe("tinaFetchWithToken", () => {
  it("uses the auth provider method, not a missing Client.fetchWithToken", () => {
    const calls: string[] = [];
    const authProvider = {
      fetchWithToken: async (input: string) => {
        calls.push(input);
        return new Response(null, { status: 200 });
      },
    };
    const tina = {
      fetchWithToken: async () => {
        throw new Error("Client.fetchWithToken does not exist at runtime");
      },
      authProvider,
    };
    const bound = tinaFetchWithToken(tina);
    assert.equal(typeof bound, "function");
    return bound!("/api/preview/enter").then(() => {
      assert.deepEqual(calls, ["/api/preview/enter"]);
    });
  });

  it("is undefined when only the Client is present without an auth provider", () => {
    assert.equal(tinaFetchWithToken({ branch: "main" }), undefined);
    assert.equal(tinaFetchWithToken(undefined), undefined);
  });
});

describe("enterTinaDraftMode", () => {
  it("does not fetch when there is no stored session token", async () => {
    let fetched = false;
    const ok = await enterTinaDraftMode({
      api: {
        tina: {
          branch: "gb/tina-preview-test",
          authProvider: {
            getToken: async () => ({ id_token: null, access_token: null }),
            fetchWithToken: async () => {
              fetched = true;
              return new Response(null, { status: 200 });
            },
          },
        },
      },
    });
    assert.equal(ok, false);
    assert.equal(fetched, false);
  });

  it("enters draft mode with the session token and current branch", async () => {
    const urls: string[] = [];
    const ok = await enterTinaDraftMode({
      api: {
        tina: {
          getBranch: () => "gb/tina-preview-test",
          authProvider: {
            getToken: async () => ({ id_token: "id", access_token: "access" }),
            fetchWithToken: async (input: string) => {
              urls.push(input);
              return new Response(JSON.stringify({ ok: true }), { status: 200 });
            },
          },
        },
      },
    });
    assert.equal(ok, true);
    assert.deepEqual(urls, [draftModeEnterUrl("gb/tina-preview-test")]);
  });
});

describe("changeTinaDraftBranch", () => {
  it("posts the official change-branch URL", async () => {
    const urls: string[] = [];
    const ok = await changeTinaDraftBranch(
      {
        api: {
          tina: {
            authProvider: {
              fetchWithToken: async (input: string) => {
                urls.push(input);
                return new Response(JSON.stringify({ ok: true }), { status: 200 });
              },
            },
          },
        },
      },
      "gb/tina-preview-test",
    );
    assert.equal(ok, true);
    assert.deepEqual(urls, [draftModeChangeBranchUrl("gb/tina-preview-test")]);
  });
});

describe("branchFromTinaClient", () => {
  it("prefers getBranch() over the cached field", () => {
    assert.equal(
      branchFromTinaClient({ branch: "main", getBranch: () => "gb/tina-preview-test" }),
      "gb/tina-preview-test",
    );
  });
});

describe("reloadSameOriginPreviewIframes", () => {
  it("reloads same-origin /blog iframes and leaves admin and foreign frames alone", () => {
    const attrs: { src: string; set?: string }[] = [
      { src: "https://gordonbeeming.com/blog/2026-11-20/tina-preview-test" },
      { src: "https://gordonbeeming.com/admin/#/~/blog/x" },
      { src: "https://identity.tinajs.io/ignored" },
    ];
    const doc = {
      querySelectorAll: () =>
        attrs.map((row) => ({
          getAttribute: (name: string) => (name === "src" ? row.src : null),
          setAttribute: (name: string, value: string) => {
            if (name === "src") row.set = value;
          },
        })),
    };
    const reloaded = reloadSameOriginPreviewIframes(
      doc as unknown as Pick<Document, "querySelectorAll">,
      "https://gordonbeeming.com",
    );
    assert.equal(reloaded, 1);
    assert.equal(attrs[0].set, "/blog/2026-11-20/tina-preview-test");
    assert.equal(attrs[1].set, undefined);
    assert.equal(attrs[2].set, undefined);
  });
});
