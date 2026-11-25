import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractVideoId,
  visibleCaption,
  youtubeEmbedSrc,
} from "./YouTubeEmbed-core.ts";

describe("visibleCaption", () => {
  it("returns a real video title", () => {
    assert.equal(
      visibleCaption("Bug Reports with Context: YakShaver Anywhere + Azure App Insights"),
      "Bug Reports with Context: YakShaver Anywhere + Azure App Insights",
    );
    assert.equal(
      visibleCaption("Low Level explains the eMudhra certificate issue"),
      "Low Level explains the eMudhra certificate issue",
    );
  });

  it("skips empty, whitespace, and generic iframe titles", () => {
    assert.equal(visibleCaption(undefined), undefined);
    assert.equal(visibleCaption("  "), undefined);
    assert.equal(visibleCaption("YouTube video"), undefined);
    assert.equal(visibleCaption("YouTube video player"), undefined);
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
