import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bindTinaDraftModeHooks,
  branchForDraftMode,
  branchFromTinaClient,
  changeTinaDraftBranch,
  decodeBranchName,
  draftModeChangeBranchUrl,
  draftModeEnterUrl,
  enterTinaDraftMode,
  reloadSameOriginPreviewIframes,
  storedTinaBranch,
  tinaFetchWithToken,
} from "./enter-draft-mode.ts";

describe("draftModeEnterUrl", () => {
  it("always includes a same-origin slug and the branch when present", () => {
    assert.equal(draftModeEnterUrl("gb/tina-preview-test"), "/api/preview/enter?branch=gb%2Ftina-preview-test&slug=%2F");
    assert.equal(draftModeEnterUrl(""), "/api/preview/enter?slug=%2F");
    assert.equal(draftModeEnterUrl(null), "/api/preview/enter?slug=%2F");
  });

  it("decodes a Client.getBranch() value before putting it in the query", () => {
    assert.equal(
      draftModeEnterUrl("gb%2Ftina-preview-test"),
      "/api/preview/enter?branch=gb%2Ftina-preview-test&slug=%2F",
    );
  });
});

describe("draftModeChangeBranchUrl", () => {
  it("encodes a slashed branch name", () => {
    assert.equal(
      draftModeChangeBranchUrl("gb/tina-preview-test"),
      "/api/preview/change-branch?branch=gb%2Ftina-preview-test",
    );
  });

  it("does not double-encode a Client.getBranch() value", () => {
    assert.equal(
      draftModeChangeBranchUrl("gb%2Ftina-preview-test"),
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

function signedInClient(options: {
  branch?: string;
  getBranch?: () => string;
  fetch: (input: string) => Promise<Response>;
}) {
  return {
    api: {
      tina: {
        branch: options.branch,
        getBranch: options.getBranch,
        authProvider: {
          getToken: async () => ({ id_token: "id", access_token: "access" }),
          fetchWithToken: options.fetch,
        },
      },
    },
  };
}

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
    const ok = await enterTinaDraftMode(
      signedInClient({
        getBranch: () => "gb/tina-preview-test",
        fetch: async (input: string) => {
          urls.push(input);
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        },
      }),
    );
    assert.equal(ok, true);
    assert.deepEqual(urls, [draftModeEnterUrl("gb/tina-preview-test")]);
  });

  it("decodes getBranch() and prefers the event branch name", async () => {
    const urls: string[] = [];
    const ok = await enterTinaDraftMode(
      signedInClient({
        getBranch: () => "gb%2Fold-branch",
        fetch: async (input: string) => {
          urls.push(input);
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        },
      }),
      "gb%2Ftina-preview-test",
    );
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
  it("prefers getBranch() over the cached field and decodes it", () => {
    assert.equal(
      branchFromTinaClient({ branch: "main", getBranch: () => "gb%2Ftina-preview-test" }),
      "gb/tina-preview-test",
    );
  });
});

describe("branchForDraftMode", () => {
  it("prefers the override, then the client, then the stored branch", () => {
    const storage = { getItem: () => "gb/stored" };
    assert.equal(
      branchForDraftMode({ getBranch: () => "main" }, "gb/override", storage),
      "gb/override",
    );
    assert.equal(branchForDraftMode({ getBranch: () => "gb/client" }, "", storage), "gb/client");
    assert.equal(branchForDraftMode({ getBranch: () => "" }, "", storage), "gb/stored");
    assert.equal(storedTinaBranch({ getItem: () => "gb%2Fstored" }), "gb/stored");
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

describe("bindTinaDraftModeHooks", () => {
  it("enters draft mode and reloads iframes on branch:change, not only change-branch", async () => {
    const urls: string[] = [];
    const handlers = new Map<string, (event: { branchName?: string }) => void>();
    let reloads = 0;
    const cms = {
      ...signedInClient({
        getBranch: () => "main",
        fetch: async (input: string) => {
          urls.push(input);
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        },
      }),
      events: {
        subscribe: (event: string, handler: (event: { branchName?: string }) => void) => {
          handlers.set(event, handler);
        },
      },
    };
    bindTinaDraftModeHooks(cms, {
      runtime: false,
      reload: () => {
        reloads += 1;
        return 1;
      },
    });
    assert.equal(handlers.has("cms:login"), false);
    assert.equal(typeof handlers.get("branch:change"), "function");
    handlers.get("branch:change")!({ branchName: "gb%2Ftina-preview-test" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(urls, [draftModeEnterUrl("gb/tina-preview-test")]);
    assert.equal(reloads, 1);
  });

  it("serializes a first enter and a following branch:change so the last branch wins", async () => {
    const urls: string[] = [];
    const handlers = new Map<string, (event: { branchName?: string }) => void>();
    const waits: Array<() => void> = [];
    const cms = {
      ...signedInClient({
        getBranch: () => "main",
        fetch: async (input: string) => {
          urls.push(input);
          await new Promise<void>((resolve) => waits.push(resolve));
          return new Response(JSON.stringify({ ok: true }), { status: 200 });
        },
      }),
      events: {
        subscribe: (event: string, handler: (event: { branchName?: string }) => void) => {
          handlers.set(event, handler);
        },
      },
    };
    const { enter } = bindTinaDraftModeHooks(cms, { runtime: false, reload: () => 0 });
    const first = enter();
    handlers.get("branch:change")!({ branchName: "gb/tina-preview-test" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(urls.length, 1);
    assert.equal(urls[0], draftModeEnterUrl("main"));
    waits[0]!();
    await first;
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(urls[1], draftModeEnterUrl("gb/tina-preview-test"));
    waits[1]!();
  });
});

describe("decodeBranchName", () => {
  it("decodes a Client.getBranch() value", () => {
    assert.equal(decodeBranchName("gb%2Ftina-preview-test"), "gb/tina-preview-test");
  });
});
