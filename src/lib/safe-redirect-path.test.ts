import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeRedirectPath } from "./safe-redirect-path.ts";

describe("safeRedirectPath", () => {
  it("keeps a same-origin relative path, query, and hash", () => {
    assert.equal(safeRedirectPath("/about"), "/about");
    assert.equal(
      safeRedirectPath("/blog/2026-10-29/adding-yakshaver-recording-to-an-app?utm=1#comments"),
      "/blog/2026-10-29/adding-yakshaver-recording-to-an-app?utm=1#comments",
    );
  });

  it("rejects missing, absolute, and protocol-relative values", () => {
    assert.equal(safeRedirectPath(null), "/");
    assert.equal(safeRedirectPath(""), "/");
    assert.equal(safeRedirectPath("about"), "/");
    assert.equal(safeRedirectPath("https://evil.example/"), "/");
    assert.equal(safeRedirectPath("//evil.example"), "/");
    assert.equal(safeRedirectPath("/\\evil.example"), "/");
    assert.equal(safeRedirectPath("\\\\evil.example"), "/");
  });
});
