import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parsePostFilename,
  postDateFolder,
  postFilename,
  slugifyTitle,
} from "./post-filename.ts";

describe("slugifyTitle", () => {
  it("slugifies the weekly roundup title, dropping the mid dot", () => {
    assert.equal(
      slugifyTitle("This Week in Developer Tech · W07"),
      "this-week-in-developer-tech-w07",
    );
  });

  it("lowercases and collapses punctuation and spaces to single hyphens", () => {
    assert.equal(slugifyTitle("Hello, World!"), "hello-world");
    assert.equal(slugifyTitle("  Foo   Bar  "), "foo-bar");
    assert.equal(
      slugifyTitle("This-Week-in-Developer-Tech--W07"),
      "this-week-in-developer-tech-w07",
    );
    assert.equal(slugifyTitle("C++ tips — draft"), "c-tips-draft");
    assert.equal(slugifyTitle("Gordon's blog"), "gordons-blog");
  });

  it("strips diacritics and drops other symbols", () => {
    assert.equal(slugifyTitle("Café déjà vu"), "cafe-deja-vu");
    assert.equal(slugifyTitle("Hello 👋 World"), "hello-world");
  });

  it("returns an empty string when nothing alphanumeric remains", () => {
    assert.equal(slugifyTitle("· · ·"), "");
    assert.equal(slugifyTitle(""), "");
  });
});

describe("postDateFolder", () => {
  it("uses a bare YYYY-MM-DD date as-is", () => {
    assert.equal(postDateFolder("2026-11-12"), "2026-11-12");
  });

  it("uses Australia/Brisbane, not UTC, when the date is a timestamp", () => {
    // 19 Nov 2026 00:00 in Brisbane is 18 Nov 14:00 UTC.
    assert.equal(postDateFolder("2026-11-18T14:00:00.000Z"), "2026-11-19");
    // The W07 draft's stored timestamp.
    assert.equal(postDateFolder("2026-11-19T00:30:46.371Z"), "2026-11-19");
    // Still 18 Nov in Brisbane (8pm).
    assert.equal(postDateFolder("2026-11-18T10:00:00.000Z"), "2026-11-18");
  });

  it("falls back to now in Australia/Brisbane when date is missing or invalid", () => {
    const brisbaneEvening = new Date("2026-11-18T10:00:00.000Z");
    const brisbaneMorning = new Date("2026-11-18T16:00:00.000Z");
    assert.equal(postDateFolder(undefined, brisbaneEvening), "2026-11-18");
    assert.equal(postDateFolder(null, brisbaneMorning), "2026-11-19");
    assert.equal(postDateFolder("not-a-date", brisbaneMorning), "2026-11-19");
  });
});

describe("postFilename", () => {
  const now = new Date("2026-11-18T16:00:00.000Z"); // 19 Nov 2026 in Brisbane

  it("builds /<date>/<slug> from title and date", () => {
    assert.equal(
      postFilename(
        { title: "This Week in Developer Tech · W07", date: "2026-11-19" },
        now,
      ),
      "/2026-11-19/this-week-in-developer-tech-w07",
    );
  });

  it("uses today's Brisbane date when the date field is empty", () => {
    assert.equal(
      postFilename({ title: "This Week in Developer Tech · W07" }, now),
      "/2026-11-19/this-week-in-developer-tech-w07",
    );
  });

  it("falls back to untitled when the title is empty", () => {
    assert.equal(postFilename({ title: "", date: "2026-11-06" }, now), "/2026-11-06/untitled");
  });
});

describe("parsePostFilename", () => {
  it("keeps a date folder and slugifies the rest", () => {
    assert.equal(
      parsePostFilename("2026-11-19/This Week in Developer Tech · W07"),
      "/2026-11-19/this-week-in-developer-tech-w07",
    );
    assert.equal(
      parsePostFilename("/2026-11-19/This-Week-in-Developer-Tech--W07"),
      "/2026-11-19/this-week-in-developer-tech-w07",
    );
  });

  it("slugifies a title typed without a date folder", () => {
    assert.equal(
      parsePostFilename("This Week in Developer Tech · W07"),
      "/this-week-in-developer-tech-w07",
    );
  });
});
