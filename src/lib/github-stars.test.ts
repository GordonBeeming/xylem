import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applySnapshotStarCounts, parseGitHubRepo } from "./github-stars-core.ts";
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

describe("applySnapshotStarCounts", () => {
  it("fills missing star counts from the snapshot and keeps existing ones", () => {
    const projects = applySnapshotStarCounts(
      [
        { slug: "myterm", githubStars: 9 },
        { slug: "xylem" },
        { slug: "private-app" },
      ],
      [
        { slug: "myterm", githubStars: 1 },
        { slug: "xylem", githubStars: 4 },
        { slug: "other", githubStars: 8 },
      ],
    );
    assert.deepEqual(projects, [
      { slug: "myterm", githubStars: 9 },
      { slug: "xylem", githubStars: 4 },
      { slug: "private-app" },
    ]);
  });
});
