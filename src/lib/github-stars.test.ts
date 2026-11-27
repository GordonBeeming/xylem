import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseGitHubRepo } from "./github-stars-core.ts";
import { shouldFetchLiveGitHubStars } from "./tina-preview-mode-core.ts";

describe("parseGitHubRepo", () => {
  it("reads owner/repo from a GitHub URL", () => {
    assert.equal(
      parseGitHubRepo("https://github.com/GordonBeeming/myterm"),
      "GordonBeeming/myterm",
    );
    assert.equal(parseGitHubRepo("https://example.com/GordonBeeming/myterm"), null);
    assert.equal(parseGitHubRepo("not a url"), null);
  });
});

describe("shouldFetchLiveGitHubStars", () => {
  it("fetches during the Pages build and local dev", () => {
    assert.equal(shouldFetchLiveGitHubStars({}), true);
    assert.equal(shouldFetchLiveGitHubStars({ XYLEM_PREVIEW: "" }), true);
  });

  it("uses snapshot star counts on the preview Worker", () => {
    assert.equal(shouldFetchLiveGitHubStars({ XYLEM_PREVIEW: "1" }), false);
  });
});
