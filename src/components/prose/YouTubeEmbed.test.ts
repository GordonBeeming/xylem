import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractVideoId,
  formatVideoDuration,
  visibleCaption,
  youtubeEmbedSrc,
} from "./YouTubeEmbed-core.ts";

describe("formatVideoDuration", () => {
  it("formats seconds as SSW-style lengths", () => {
    assert.equal(formatVideoDuration(9 * 60), "9 min");
    assert.equal(formatVideoDuration(459), "8 min");
    assert.equal(formatVideoDuration(66), "1 min");
    assert.equal(formatVideoDuration(58), "58 sec");
    assert.equal(formatVideoDuration(6), "6 sec");
    assert.equal(formatVideoDuration(3600), "1 hr");
    assert.equal(formatVideoDuration(5146), "1 hr 26 min");
    assert.equal(formatVideoDuration("459"), "8 min");
  });

  it("ignores missing or invalid values", () => {
    assert.equal(formatVideoDuration(undefined), undefined);
    assert.equal(formatVideoDuration(null), undefined);
    assert.equal(formatVideoDuration(""), undefined);
    assert.equal(formatVideoDuration(0), undefined);
    assert.equal(formatVideoDuration(-12), undefined);
    assert.equal(formatVideoDuration("nope"), undefined);
  });
});

describe("visibleCaption", () => {
  it("formats a real video title with the SSW Video: prefix", () => {
    assert.equal(
      visibleCaption("Low Level explains the eMudhra certificate issue"),
      "Video: Low Level explains the eMudhra certificate issue",
    );
    assert.equal(
      visibleCaption("Agentic Engineering vs. Vibe Coding"),
      "Video: Agentic Engineering vs. Vibe Coding",
    );
  });

  it("appends duration when known and does not invent it when missing", () => {
    assert.equal(
      visibleCaption("VSTS Overview - 01 - Account", 459),
      "Video: VSTS Overview - 01 - Account (8 min)",
    );
    assert.equal(
      visibleCaption("Bug Reports with Context: YakShaver Anywhere + Azure App Insights"),
      "Video: Bug Reports with Context: YakShaver Anywhere + Azure App Insights",
    );
  });

  it("does not double the Video: prefix or an existing length", () => {
    assert.equal(
      visibleCaption("Video: Intro to Scrum in Under 10 Minutes (9 min)"),
      "Video: Intro to Scrum in Under 10 Minutes (9 min)",
    );
    assert.equal(
      visibleCaption("Video: Intro to Scrum in Under 10 Minutes (9 min)", 9 * 60),
      "Video: Intro to Scrum in Under 10 Minutes (9 min)",
    );
    assert.equal(
      visibleCaption("Figure: Scrum video", 120),
      "Video: Scrum video (2 min)",
    );
  });

  it("strips a trailing full stop from the caption", () => {
    assert.equal(
      visibleCaption("How to search on Outlook.", 120),
      "Video: How to search on Outlook (2 min)",
    );
  });

  it("skips empty, whitespace, and generic iframe titles", () => {
    assert.equal(visibleCaption(undefined), undefined);
    assert.equal(visibleCaption("  "), undefined);
    assert.equal(visibleCaption("YouTube video"), undefined);
    assert.equal(visibleCaption("YouTube video player"), undefined);
  });

  it("leaves non-video widget titles unprefixed", () => {
    assert.equal(
      visibleCaption("Codealike Intro", undefined, { isVideo: false }),
      "Codealike Intro",
    );
  });
});

describe("youtubeEmbedSrc", () => {
  it("rewrites a YouTube embed URL to youtube-nocookie", () => {
    assert.equal(extractVideoId("https://www.youtube.com/embed/SIekPasYGbM"), "SIekPasYGbM");
    assert.equal(
      youtubeEmbedSrc("https://www.youtube.com/embed/SIekPasYGbM"),
      "https://www.youtube-nocookie.com/embed/SIekPasYGbM?rel=0",
    );
    assert.equal(
      youtubeEmbedSrc("//www.youtube.com/embed/m4gx5YoRYfM"),
      "https://www.youtube-nocookie.com/embed/m4gx5YoRYfM?rel=0",
    );
  });

  it("leaves SlideShare and Codealike widget URLs unchanged", () => {
    const slides = "//www.slideshare.net/slideshow/embed_code/key/2vWRtvxZ3k0hIa";
    const codealike = "https://codealike.com/Profile/FactsWidget/Gordon-Beeming";
    assert.equal(extractVideoId(slides), null);
    assert.equal(extractVideoId(codealike), null);
    assert.equal(youtubeEmbedSrc(slides), slides);
    assert.equal(youtubeEmbedSrc(codealike), codealike);
    assert.equal(visibleCaption(undefined), undefined);
  });
});
