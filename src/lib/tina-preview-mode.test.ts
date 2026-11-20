import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeBranchName,
  isDocumentNavigationRequest,
  isPreviewServer,
  previewContextFromEnvAndCookies,
  tinaBranchCookieOptions,
  pickFilesystemOrTinaPost,
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

  it("decodes a URL-encoded x-branch cookie from Client.getBranch()", () => {
    assert.deepEqual(
      previewContextFromEnvAndCookies({
        previewServer: true,
        draftModeEnabled: true,
        branch: "gb%2Ftina-preview-test",
      }),
      { enabled: true, branch: "gb/tina-preview-test" },
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

describe("tinaBranchCookieOptions", () => {
  it("matches Next.js production draft-mode flags", () => {
    assert.deepEqual(tinaBranchCookieOptions("production"), {
      path: "/",
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
  });

  it("uses SameSite=Lax in development", () => {
    assert.deepEqual(tinaBranchCookieOptions("development"), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
  });
});

describe("isDocumentNavigationRequest", () => {
  it("treats a top-level document navigation as a View Preview click", () => {
    assert.equal(
      isDocumentNavigationRequest(new Headers({ "sec-fetch-mode": "navigate" })),
      true,
    );
    assert.equal(
      isDocumentNavigationRequest(new Headers({ "sec-fetch-dest": "document" })),
      true,
    );
  });

  it("treats cmsCallback fetch as a non-document request", () => {
    assert.equal(
      isDocumentNavigationRequest(new Headers({ "sec-fetch-mode": "cors" })),
      false,
    );
    assert.equal(isDocumentNavigationRequest(new Headers()), false);
  });
});

describe("decodeBranchName", () => {
  it("returns the raw Git branch name from a Client.getBranch() value", () => {
    assert.equal(decodeBranchName("gb%2Ftina-preview-test"), "gb/tina-preview-test");
    assert.equal(decodeBranchName("gb%252Ftina-preview-test"), "gb/tina-preview-test");
    assert.equal(decodeBranchName("gb/tina-preview-test"), "gb/tina-preview-test");
    assert.equal(decodeBranchName(" main "), "main");
    assert.equal(decodeBranchName(""), "");
    assert.equal(decodeBranchName(null), "");
  });
});

describe("isPreviewServer", () => {
  it("is false unless XYLEM_PREVIEW is the string 1, and is read at call time", () => {
    assert.equal(isPreviewServer({}), false);
    assert.equal(isPreviewServer({ XYLEM_PREVIEW: "" }), false);
    assert.equal(isPreviewServer({ XYLEM_PREVIEW: "true" }), false);
    assert.equal(isPreviewServer({ XYLEM_PREVIEW: "1" }), true);
  });
});

describe("pickFilesystemOrTinaPost", () => {
  it("prefers the filesystem post when it exists", () => {
    assert.equal(
      pickFilesystemOrTinaPost("filesystem", true, "tina"),
      "filesystem",
    );
  });

  it("uses the Tina post when draft mode is on and the file is not in this build", () => {
    assert.equal(pickFilesystemOrTinaPost(null, true, "tina"), "tina");
  });

  it("does not use Tina data when draft mode is off", () => {
    assert.equal(pickFilesystemOrTinaPost(null, false, "tina"), null);
  });
});
