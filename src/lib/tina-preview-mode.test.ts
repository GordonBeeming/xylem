import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  previewContextFromEnvAndCookies,
  tinaFetchOptions,
} from "./tina-preview-mode-core.ts";

describe("previewContextFromEnvAndCookies", () => {
  it("is disabled on the static Pages server", () => {
    assert.deepEqual(
      previewContextFromEnvAndCookies({
        previewServer: false,
        draftModeEnabled: true,
        branch: "tina/gb/example",
      }),
      { enabled: false, branch: null },
    );
  });

  it("is disabled on the preview server without the draft-mode cookie", () => {
    assert.deepEqual(
      previewContextFromEnvAndCookies({
        previewServer: true,
        draftModeEnabled: false,
        branch: "tina/gb/example",
      }),
      { enabled: false, branch: null },
    );
  });

  it("is enabled with the official x-branch cookie in draft mode", () => {
    assert.deepEqual(
      previewContextFromEnvAndCookies({
        previewServer: true,
        draftModeEnabled: true,
        branch: "tina/gb/example",
      }),
      { enabled: true, branch: "tina/gb/example" },
    );
  });
});

describe("tinaFetchOptions", () => {
  it("sends the official x-branch header when a branch is set", () => {
    assert.deepEqual(tinaFetchOptions("tina/gb/example"), {
      fetchOptions: { headers: { "x-branch": "tina/gb/example" } },
    });
    assert.equal(tinaFetchOptions(null), undefined);
  });
});
