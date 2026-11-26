import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeTinaImageUrl, normalizeTinaImages } from "./normalize-images.ts";

const clientId = "abc123";
const avatar = "/static/images/avatar.jpg";
const sswLight = "/static/images/ssw-logo-light.png";
const sswDark = "/static/images/ssw-logo-dark.png";
const mvpLight = "/static/images/mvp-logo-light.png";
const mvpDark = "/static/images/mvp-logo-dark.png";
const figure = "/images/yakshaver-how-it-fits.png";

describe("normalizeTinaImageUrl", () => {
  it("strips a TinaCloud CDN prefix back to the repo path", () => {
    assert.equal(
      normalizeTinaImageUrl(`https://assets.tina.io/${clientId}${sswLight}`, clientId),
      sswLight,
    );
  });

  it("unwraps a TinaCloud staging URL to the original repo path", () => {
    assert.equal(
      normalizeTinaImageUrl(
        `https://assets.tina.io/${clientId}/__staging/main/__file${sswLight}`,
        clientId,
      ),
      sswLight,
    );
    assert.equal(
      normalizeTinaImageUrl(
        `https://assets.tina.io/${clientId}/__staging/main/__file${avatar}`,
        clientId,
      ),
      avatar,
    );
    assert.equal(
      normalizeTinaImageUrl(
        `https://assets.tina.io/${clientId}/__staging/tina/gb/example/__file${figure}`,
        clientId,
      ),
      figure,
    );
  });

  it("unwraps a relative /__staging/<branch>/__file/<repoPath> src", () => {
    assert.equal(
      normalizeTinaImageUrl(`/__staging/main/__file${mvpLight}`, clientId),
      mvpLight,
    );
    assert.equal(
      normalizeTinaImageUrl(`/__staging/main/__file${mvpDark}`),
      mvpDark,
    );
  });

  it("leaves repo paths, foreign URLs, and empty strings alone", () => {
    assert.equal(normalizeTinaImageUrl(sswDark, clientId), sswDark);
    assert.equal(normalizeTinaImageUrl("https://example.com/logo.png", clientId), "https://example.com/logo.png");
    assert.equal(normalizeTinaImageUrl(""), "");
  });

  it("does not strip a different TinaCloud client ID prefix, but still unwraps staging", () => {
    const other = `https://assets.tina.io/other-client/__staging/main/__file${sswLight}`;
    assert.equal(normalizeTinaImageUrl(other, clientId), sswLight);
  });
});

describe("normalizeTinaImages", () => {
  it("restores author logo and avatar fields on a Tina author payload", () => {
    const data = {
      author: {
        name: "Gordon Beeming",
        avatar: `https://assets.tina.io/${clientId}/__staging/main/__file${avatar}`,
        company_logo_light: `/__staging/main/__file${sswLight}`,
        company_logo_dark: `https://assets.tina.io/${clientId}/__staging/main/__file${sswDark}`,
        mvp_logo_light: `https://assets.tina.io/${clientId}/__staging/main/__file${mvpLight}`,
        mvp_logo_dark: `/__staging/main/__file${mvpDark}`,
        profile_line_1: "Solution Architect",
        _values: { avatar: `https://assets.tina.io/${clientId}/__staging/main/__file${avatar}` },
      },
    };

    const normalized = normalizeTinaImages(data, clientId);

    assert.equal(normalized.author.avatar, avatar);
    assert.equal(normalized.author.company_logo_light, sswLight);
    assert.equal(normalized.author.company_logo_dark, sswDark);
    assert.equal(normalized.author.mvp_logo_light, mvpLight);
    assert.equal(normalized.author.mvp_logo_dark, mvpDark);
    assert.equal(normalized.author.profile_line_1, "Solution Architect");
    assert.equal(
      normalized.author._values.avatar,
      `https://assets.tina.io/${clientId}/__staging/main/__file${avatar}`,
    );
    assert.notEqual(normalized, data);
    assert.equal(data.author.avatar, `https://assets.tina.io/${clientId}/__staging/main/__file${avatar}`);
  });
});
