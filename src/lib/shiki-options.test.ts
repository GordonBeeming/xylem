import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Root } from "hast";
import {
  collectCodeBlockLanguages,
  languageFromClassName,
  resolveBundledLanguageId,
} from "./shiki-options.ts";

describe("languageFromClassName", () => {
  it("reads a language-* class from a string or list", () => {
    assert.equal(languageFromClassName("language-ts"), "ts");
    assert.equal(languageFromClassName(["foo", "language-tsx"]), "tsx");
    assert.equal(languageFromClassName("lang-python"), "python");
    assert.equal(languageFromClassName("not-a-language"), null);
    assert.equal(languageFromClassName(undefined), null);
  });
});

describe("resolveBundledLanguageId", () => {
  it("resolves bundled ids and common aliases, case-insensitively", () => {
    assert.equal(resolveBundledLanguageId("ts"), "ts");
    assert.equal(resolveBundledLanguageId("TypeScript"), "typescript");
    assert.equal(resolveBundledLanguageId("JS"), "js");
    assert.equal(resolveBundledLanguageId(""), null);
  });

  it("returns null for unknown language tags so highlighting can fall back to plain text", () => {
    assert.equal(resolveBundledLanguageId("not-a-real-language"), null);
    assert.equal(resolveBundledLanguageId("plaintext"), null);
  });
});

describe("collectCodeBlockLanguages", () => {
  it("collects unique languages from pre and code nodes", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "pre",
          properties: { className: ["language-ts"] },
          children: [
            {
              type: "element",
              tagName: "code",
              properties: { className: ["language-ts"] },
              children: [],
            },
          ],
        },
        {
          type: "element",
          tagName: "code",
          properties: { lang: "python" },
          children: [],
        },
      ],
    } as Root;
    const langs = collectCodeBlockLanguages(tree).sort();
    assert.deepEqual(langs, ["python", "ts"]);
  });
});
