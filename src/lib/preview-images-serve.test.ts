import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAllowedRepoImagePath,
  isSafeGitBranch,
  pickRepoImagePath,
  safeImageFilename,
} from "./preview-images-serve.ts";

describe("safeImageFilename", () => {
  it("accepts a single image basename", () => {
    assert.equal(safeImageFilename("story-list-proposal.webp"), "story-list-proposal.webp");
    assert.equal(safeImageFilename("ready-for-review-in-tina.webp"), "ready-for-review-in-tina.webp");
  });

  it("rejects traversal, nested paths, and non-images", () => {
    assert.equal(safeImageFilename("../secrets.txt"), null);
    assert.equal(safeImageFilename("content/blog/2026-11-19/images/x.webp"), null);
    assert.equal(safeImageFilename("x.txt"), null);
    assert.equal(safeImageFilename(""), null);
    assert.equal(safeImageFilename("%2e%2e%2fx.webp"), null);
  });
});

describe("isAllowedRepoImagePath", () => {
  const file = "story-list-proposal.webp";

  it("allows public/images and content/blog/**/images only", () => {
    assert.equal(isAllowedRepoImagePath(`public/images/${file}`, file), true);
    assert.equal(isAllowedRepoImagePath(`content/blog/2026-11-19/images/${file}`, file), true);
    assert.equal(isAllowedRepoImagePath("content/blog/2026-11-19/x.mdx", file), false);
    assert.equal(isAllowedRepoImagePath(`content/authors/images/${file}`, file), false);
    assert.equal(isAllowedRepoImagePath(`../public/images/${file}`, file), false);
    assert.equal(isAllowedRepoImagePath(`content/blog/2026-11-19/images/other.webp`, file), false);
  });
});

describe("pickRepoImagePath", () => {
  const file = "story-list-proposal.webp";

  it("prefers public/images when both exist", () => {
    assert.equal(
      pickRepoImagePath(
        [
          `content/blog/2026-11-19/images/${file}`,
          `public/images/${file}`,
          "README.md",
        ],
        file,
      ),
      `public/images/${file}`,
    );
  });

  it("returns the content/blog match when the file is only there", () => {
    assert.equal(
      pickRepoImagePath([`content/blog/2026-11-19/images/${file}`, "package.json"], file),
      `content/blog/2026-11-19/images/${file}`,
    );
  });

  it("ignores paths outside the allowed trees", () => {
    assert.equal(pickRepoImagePath([`src/${file}`, `content/${file}`], file), null);
  });
});

describe("isSafeGitBranch", () => {
  it("accepts ordinary and nested branch names", () => {
    assert.equal(isSafeGitBranch("main"), true);
    assert.equal(isSafeGitBranch("tina/gb/tinacms-second-time-around"), true);
  });

  it("rejects traversal and empty segments", () => {
    assert.equal(isSafeGitBranch("../main"), false);
    assert.equal(isSafeGitBranch("tina//gb"), false);
    assert.equal(isSafeGitBranch(""), false);
  });
});
