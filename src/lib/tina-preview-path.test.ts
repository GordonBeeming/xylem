import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  blogSlugFromPathname,
  blogSlugFromSearchParam,
  postRelativePath,
} from "./tina-preview-path.ts";

describe("blogSlugFromPathname", () => {
  it("reads a dated post path", () => {
    assert.equal(
      blogSlugFromPathname("/blog/2026-11-19/this-week-in-developer-tech-w07"),
      "2026-11-19/this-week-in-developer-tech-w07",
    );
  });

  it("tolerates a trailing slash or .html from a static export", () => {
    assert.equal(
      blogSlugFromPathname("/blog/2026-11-19/this-week-in-developer-tech-w07/"),
      "2026-11-19/this-week-in-developer-tech-w07",
    );
    assert.equal(
      blogSlugFromPathname("/blog/2026-11-19/this-week-in-developer-tech-w07.html"),
      "2026-11-19/this-week-in-developer-tech-w07",
    );
  });

  it("also accepts a date-less filename (the pre-fix auto slug)", () => {
    assert.equal(
      blogSlugFromPathname("/blog/This-Week-in-Developer-Tech--W07"),
      "This-Week-in-Developer-Tech--W07",
    );
  });

  it("ignores the blog index and unrelated routes", () => {
    assert.equal(blogSlugFromPathname("/blog"), null);
    assert.equal(blogSlugFromPathname("/blog/"), null);
    assert.equal(blogSlugFromPathname("/about"), null);
    assert.equal(blogSlugFromPathname("/tags/ai"), null);
  });
});

describe("blogSlugFromSearchParam", () => {
  it("strips a leading slash and .mdx suffix", () => {
    assert.equal(
      blogSlugFromSearchParam("/2026-11-19/this-week-in-developer-tech-w07.mdx"),
      "2026-11-19/this-week-in-developer-tech-w07",
    );
    assert.equal(blogSlugFromSearchParam("  "), null);
    assert.equal(blogSlugFromSearchParam(null), null);
  });
});

describe("postRelativePath", () => {
  it("appends .mdx", () => {
    assert.equal(
      postRelativePath("2026-11-19/this-week-in-developer-tech-w07"),
      "2026-11-19/this-week-in-developer-tech-w07.mdx",
    );
  });
});
