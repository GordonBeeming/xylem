import assert from "node:assert/strict";
import { describe, it } from "node:test";
import GithubSlugger from "github-slugger";
import type { TinaMarkdownContent } from "tinacms/dist/rich-text";
import {
  headingsFromBody,
  shouldRenderLiveMarkdown,
  textFromNode,
} from "./post-markdown-body.ts";
import { publicPreviewImageSrc } from "../../lib/tina-preview-images.ts";

const sampleBody = {
  type: "root",
  children: [
    {
      type: "h2",
      children: [{ type: "text", text: "Reviews and merging" }],
    },
    {
      type: "p",
      children: [{ type: "text", text: "For a personal post, I just say to merge it." }],
    },
    {
      type: "p",
      children: [{ type: "text", text: "An added paragraph in the editor." }],
    },
  ],
} as TinaMarkdownContent;

describe("shouldRenderLiveMarkdown", () => {
  it("keeps the server-rendered body when Tina edit mode is off", () => {
    assert.equal(shouldRenderLiveMarkdown(false, sampleBody), false);
    assert.equal(shouldRenderLiveMarkdown(false, undefined), false);
  });

  it("uses the live Tina body only when edit mode is on and a body exists", () => {
    assert.equal(shouldRenderLiveMarkdown(true, sampleBody), true);
    assert.equal(shouldRenderLiveMarkdown(true, undefined), false);
  });
});

describe("headingsFromBody", () => {
  it("collects h2 text and slugs from a Tina rich-text tree", () => {
    const headings = headingsFromBody(sampleBody, new GithubSlugger());
    assert.deepEqual(headings, [
      { id: "reviews-and-merging", text: "Reviews and merging" },
    ]);
  });

  it("returns no headings for an empty body", () => {
    assert.deepEqual(headingsFromBody({ type: "root", children: [] }, new GithubSlugger()), []);
    assert.deepEqual(headingsFromBody(undefined, new GithubSlugger()), []);
  });
});

describe("textFromNode", () => {
  it("joins text from a paragraph so a live body edit is detectable", () => {
    assert.match(textFromNode(sampleBody), /An added paragraph in the editor/);
  });
});

describe("Figure src in the shared markdown map", () => {
  it("maps leftover /uploads and Tina staging srcs to /images/<file>", () => {
    assert.equal(
      publicPreviewImageSrc("/images/story-list-proposal.webp"),
      "/images/story-list-proposal.webp",
    );
    assert.equal(
      publicPreviewImageSrc("/uploads/images/story-list-proposal.webp"),
      "/images/story-list-proposal.webp",
    );
    assert.equal(
      publicPreviewImageSrc(
        "/__staging/tina/gb/example/__file/images/story-list-proposal.webp",
      ),
      "/images/story-list-proposal.webp",
    );
  });
});
