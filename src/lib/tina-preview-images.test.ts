import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  contentImagesFolder,
  isPublicImagesPath,
  parseTinaStagingPath,
  previewContentImageUrl,
  rewritePreviewImageData,
  publicPreviewImageSrc,
} from "./tina-preview-images.ts";

const slug = "2026-11-19/tinacms-second-time-around";
const branch = "tina/gb/tinacms-second-time-around";
const preview =
  "/__preview-content/tina/gb/tinacms-second-time-around/__file/content/blog/2026-11-19/images/story-list-proposal.webp";

describe("contentImagesFolder", () => {
  it("uses the date folder next to the post", () => {
    assert.equal(contentImagesFolder(slug), "content/blog/2026-11-19/images");
  });

  it("falls back to content/blog/images when there is no date folder", () => {
    assert.equal(contentImagesFolder("legacy-post"), "content/blog/images");
  });
});

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

describe("previewContentImageUrl", () => {
  it("rewrites a Tina staging path to the same-origin worker proxy", () => {
    assert.equal(
      previewContentImageUrl(
        "/__staging/tina/gb/tinacms-second-time-around/__file/images/story-list-proposal.webp",
        { slug },
      ),
      preview,
    );
  });

  it("rewrites /images/<file> when the editor branch is known", () => {
    assert.equal(
      previewContentImageUrl("/images/story-list-proposal.webp", { slug, branch }),
      preview,
    );
  });

  it("rewrites leftover /uploads/images/<file> the same way as /images/<file>", () => {
    assert.equal(
      previewContentImageUrl("/uploads/images/story-list-proposal.webp", { slug, branch }),
      preview,
    );
  });

  it("leaves /images/<file> alone without a branch, and leaves foreign URLs alone", () => {
    assert.equal(
      previewContentImageUrl("/images/story-list-proposal.webp", { slug }),
      "/images/story-list-proposal.webp",
    );
    assert.equal(
      previewContentImageUrl("https://example.com/pic.webp", { slug, branch }),
      "https://example.com/pic.webp",
    );
    assert.equal(
      previewContentImageUrl("/static/images/headshot.png", { slug, branch }),
      "/static/images/headshot.png",
    );
  });
});

describe("rewritePreviewImageData", () => {
  it("rewrites Figure src values inside a Tina body tree", () => {
    const data = {
      title: "TinaCMS, Second Time Around",
      body: {
        type: "root",
        children: [
          {
            type: "mdxJsxFlowElement",
            name: "Figure",
            props: {
              src: "/__staging/tina/gb/tinacms-second-time-around/__file/images/ssw-rule-live.webp",
              alt: "rule is live",
            },
          },
        ],
      },
    };
    const rewritten = rewritePreviewImageData(data, { slug });
    assert.equal(
      rewritten.body.children[0].props.src,
      "/__preview-content/tina/gb/tinacms-second-time-around/__file/content/blog/2026-11-19/images/ssw-rule-live.webp",
    );
    assert.equal(data.body.children[0].props.src.startsWith("/__staging/"), true);
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
