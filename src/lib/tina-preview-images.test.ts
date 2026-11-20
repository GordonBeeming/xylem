import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isPublicImagesPath,
  parseTinaStagingPath,
  publicPreviewImageSrc,
} from "./tina-preview-images.ts";

const branch = "tina/gb/tinacms-second-time-around";

describe("parseTinaStagingPath", () => {
  it("reads a branch that itself contains slashes", () => {
    assert.deepEqual(
      parseTinaStagingPath(
        "/__staging/tina/gb/tinacms-second-time-around/__file/images/story-list-proposal.webp",
      ),
      { branch, repoPath: "images/story-list-proposal.webp" },
    );
  });

  it("accepts an absolute staging URL", () => {
    const parsed = parseTinaStagingPath(
      "https://gordonbeeming.com/__staging/tina/gb/tinacms-second-time-around/__file/images/ssw-rule-live.webp",
    );
    assert.deepEqual(parsed, { branch, repoPath: "images/ssw-rule-live.webp" });
  });
});

describe("isPublicImagesPath", () => {
  it("matches a flat /images file and rejects other paths", () => {
    assert.equal(isPublicImagesPath("/images/story-list-proposal.webp"), true);
    assert.equal(isPublicImagesPath("/uploads/story-list-proposal.webp"), false);
    assert.equal(isPublicImagesPath("/images/nested/file.webp"), false);
  });
});

describe("publicPreviewImageSrc", () => {
  it("keeps a public /images path as /images/<file>", () => {
    assert.equal(
      publicPreviewImageSrc("/images/story-list-proposal.webp"),
      "/images/story-list-proposal.webp",
    );
  });

  it("maps leftover /uploads paths and Tina staging paths to /images/<file>", () => {
    assert.equal(
      publicPreviewImageSrc("/uploads/images/story-list-proposal.webp"),
      "/images/story-list-proposal.webp",
    );
    assert.equal(
      publicPreviewImageSrc(
        "/__staging/tina/gb/tinacms-second-time-around/__file/images/ssw-rule-live.webp",
      ),
      "/images/ssw-rule-live.webp",
    );
  });

  it("leaves unrelated srcs alone", () => {
    assert.equal(publicPreviewImageSrc("/static/images/avatar.png"), "/static/images/avatar.png");
    assert.equal(publicPreviewImageSrc("https://example.com/x.webp"), "https://example.com/x.webp");
  });
});
