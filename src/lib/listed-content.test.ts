import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeFilesystemAndTinaPosts, postMetaFromTinaConnectionNode } from "./listed-content-core.ts";

const published = {
  title: "Published",
  date: "2026-01-01T00:00:00.000Z",
  tags: [],
  slug: "2026-01-01/published",
  readingTime: { text: "1 min read", minutes: 1 },
};

describe("mergeFilesystemAndTinaPosts", () => {
  it("keeps filesystem posts and adds branch-only Tina documents", () => {
    const tina = {
      title: "Tina preview unpublished-branch test",
      date: "2026-11-20T00:00:00.000Z",
      tags: ["TinaCMS"],
      slug: "2026-11-20/tina-preview-test",
      readingTime: { text: "1 min read", minutes: 1 },
    };
    const merged = mergeFilesystemAndTinaPosts([published], [tina]);
    assert.equal(merged[0]?.slug, "2026-11-20/tina-preview-test");
    assert.equal(merged[1]?.slug, "2026-01-01/published");
    assert.equal(merged.length, 2);
  });

  it("lets the Tina document win when the same slug exists on disk", () => {
    const tina = { ...published, title: "Live title" };
    const merged = mergeFilesystemAndTinaPosts([published], [tina]);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.title, "Live title");
  });
});

describe("postMetaFromTinaConnectionNode", () => {
  it("reads the slug from the Tina relative path", () => {
    const meta = postMetaFromTinaConnectionNode({
      title: "Tina preview unpublished-branch test",
      date: "2026-11-20T00:00:00.000Z",
      tags: ["TinaCMS"],
      _sys: { relativePath: "2026-11-20/tina-preview-test.mdx" },
    });
    assert.equal(meta?.slug, "2026-11-20/tina-preview-test");
    assert.equal(meta?.title, "Tina preview unpublished-branch test");
  });
});
