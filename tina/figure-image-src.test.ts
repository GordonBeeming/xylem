import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeFigureImageSrc } from "./figure-image-src.ts";

describe("normalizeFigureImageSrc", () => {
  it("keeps an existing /images/<file> src", () => {
    assert.equal(
      normalizeFigureImageSrc("/images/story-list-proposal.webp"),
      "/images/story-list-proposal.webp",
    );
  });

  it("maps /uploads/images/<file> and uploads/images/<file> back to /images/<file>", () => {
    assert.equal(
      normalizeFigureImageSrc("/uploads/images/story-list-proposal.webp"),
      "/images/story-list-proposal.webp",
    );
    assert.equal(
      normalizeFigureImageSrc("uploads/images/ssw-rule-live.webp"),
      "/images/ssw-rule-live.webp",
    );
  });

  it("maps a file uploaded at the old media root to /images/<file>", () => {
    assert.equal(
      normalizeFigureImageSrc("/uploads/story-list-proposal.webp"),
      "/images/story-list-proposal.webp",
    );
  });

  it("leaves static, absolute, and empty values alone", () => {
    assert.equal(
      normalizeFigureImageSrc("/static/images/avatar.jpg"),
      "/static/images/avatar.jpg",
    );
    assert.equal(
      normalizeFigureImageSrc("https://example.com/pic.webp"),
      "https://example.com/pic.webp",
    );
    assert.equal(normalizeFigureImageSrc(""), "");
    assert.equal(normalizeFigureImageSrc(undefined), "");
  });
});

/**
 * Characterises Tina Cloud's resolveMediaCloudToRelative (from
 * @tinacms/graphql media-utils): a staging URL is converted back to
 * `${mediaRoot}${path after __file}`. mediaRoot "uploads" is what rewrote
 * Figure srcs to /uploads/images/x; an empty mediaRoot keeps /images/x
 * and /static/images/x intact.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tinaCloudSavedImageSrc(
  cloudOrRelative: string,
  mediaRoot: string,
  clientId = "test-client",
): string {
  const cleanMediaRoot = mediaRoot ? `/${mediaRoot.replace(/^\/+|\/+$/g, "")}` : "";
  const cloudUrl = new RegExp(`^https://[^/]+/${escapeRegExp(clientId)}`);
  if (!cloudUrl.test(cloudOrRelative)) return cloudOrRelative;
  const afterCloud = cloudOrRelative.replace(cloudUrl, "");
  const match = afterCloud.match(/^\/__staging\/.+?\/__file(\/.*)$/);
  const afterStaging = match ? match[1] : afterCloud;
  return `${cleanMediaRoot}${afterStaging}`;
}

describe("Tina Cloud image save with mediaRoot", () => {
  const clientId = "abc123";
  const figureSrc = "/images/story-list-proposal.webp";
  const avatarSrc = "/static/images/avatar.jpg";
  const stagingFigure = `https://assets.tina.io/${clientId}/__staging/tina/gb/tinacms-second-time-around/__file${figureSrc}`;
  const stagingAvatar = `https://assets.tina.io/${clientId}/__staging/main/__file${avatarSrc}`;

  it("prefixes /uploads when mediaRoot is uploads (the bug)", () => {
    assert.equal(
      tinaCloudSavedImageSrc(stagingFigure, "uploads", clientId),
      "/uploads/images/story-list-proposal.webp",
    );
  });

  it("keeps /images and /static/images when mediaRoot is empty", () => {
    assert.equal(tinaCloudSavedImageSrc(stagingFigure, "", clientId), figureSrc);
    assert.equal(tinaCloudSavedImageSrc(stagingAvatar, "", clientId), avatarSrc);
  });

  it("leaves a relative path unchanged (local mode / already-relative values)", () => {
    assert.equal(tinaCloudSavedImageSrc(figureSrc, "uploads", clientId), figureSrc);
    assert.equal(tinaCloudSavedImageSrc(figureSrc, "", clientId), figureSrc);
  });
});
