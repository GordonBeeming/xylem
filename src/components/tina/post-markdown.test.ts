import assert from "node:assert/strict";
import { describe, it } from "node:test";
import GithubSlugger from "github-slugger";
import type { TinaMarkdownContent } from "tinacms/dist/rich-text";
import {
  headingsFromBody,
  hasInvalidMarkdown,
  markdownFromInvalidBody,
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

  it("keeps the server-rendered body when Tina could not parse the MDX", () => {
    const invalid = {
      type: "root",
      children: [
        {
          type: "invalid_markdown",
          value: '## VSTS Accounts\n\n<YouTubeEmbed src="https://www.youtube.com/embed/Y7NQSB99DJ8" width="560" height="315" title="VSTS Overview - 01 - Account" duration={459} />\n',
          children: [{ type: "text", text: "" }],
        },
      ],
    } as TinaMarkdownContent;
    assert.equal(hasInvalidMarkdown(invalid), true);
    assert.equal(hasInvalidMarkdown(sampleBody), false);
    assert.equal(shouldRenderLiveMarkdown(true, invalid), false);
    assert.match(markdownFromInvalidBody(invalid) ?? "", /VSTS Accounts/);
    assert.match(markdownFromInvalidBody(invalid) ?? "", /YouTubeEmbed/);
  });

  it("strips frontmatter from an invalid_markdown value", () => {
    const invalid = {
      type: "root",
      children: [
        {
          type: "invalid_markdown",
          value: "---\ntitle: Demo\n---\n\n## Hello\n",
        },
      ],
    } as TinaMarkdownContent;
    assert.equal(markdownFromInvalidBody(invalid), "## Hello\n");
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
