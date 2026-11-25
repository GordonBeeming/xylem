import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import {
  expandSelfClosingMdxTags,
  normalizeJsxLiteralAttributes,
  preprocessPostMarkdown,
  rehypeRestoreMdxComponentNames,
  restoreMdxComponentTagName,
} from "./render-post-markdown-core.ts";

type HastNode = {
  type?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function processToHast(source: string): HastNode {
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeRestoreMdxComponentNames);
  return processor.runSync(processor.parse(source)) as HastNode;
}

function collectTagNames(node: HastNode, tags: string[] = []): string[] {
  if (node.type === "element" && node.tagName) tags.push(node.tagName);
  for (const child of node.children ?? []) collectTagNames(child, tags);
  return tags;
}

function findElement(node: HastNode, tagName: string): HastNode | undefined {
  if (node.type === "element" && node.tagName === tagName) return node;
  for (const child of node.children ?? []) {
    const found = findElement(child, tagName);
    if (found) return found;
  }
  return undefined;
}

describe("normalizeJsxLiteralAttributes", () => {
  it("quotes numeric and boolean JSX attribute values", () => {
    const source = `<YouTubeEmbed src="https://www.youtube.com/embed/Y7NQSB99DJ8" duration={459} allowfullscreen={true} />`;
    assert.match(normalizeJsxLiteralAttributes(source), /duration="459"/);
    assert.match(normalizeJsxLiteralAttributes(source), /allowfullscreen="true"/);
  });
});

describe("expandSelfClosingMdxTags", () => {
  it("closes self-closing Figure and YouTubeEmbed tags so HTML cannot swallow siblings", () => {
    const source = [
      `<YouTubeEmbed src="https://www.youtube.com/embed/Y7NQSB99DJ8" width="560" height="315" title="VSTS Overview - 01 - Account" duration="459" />`,
      "",
      "## Team Projects",
      "",
      `<Figure src="/images/example.png" alt="Example" caption="A caption" />`,
    ].join("\n");
    const expanded = expandSelfClosingMdxTags(source);
    assert.match(expanded, /<\/YouTubeEmbed>/);
    assert.match(expanded, /<\/Figure>/);
    assert.match(expanded, /## Team Projects/);
  });

  it("leaves an already-closed YouTubeEmbed (SlideShare widget) unchanged", () => {
    const source = `<YouTubeEmbed style="margin-bottom: 5px;" src="//www.slideshare.net/slideshow/embed_code/key/2vWRtvxZ3k0hIa" width="960" height="540"> </YouTubeEmbed>`;
    assert.equal(expandSelfClosingMdxTags(source), source);
  });
});

describe("restoreMdxComponentTagName", () => {
  it("restores lowercased YouTubeEmbed tags", () => {
    assert.equal(
      restoreMdxComponentTagName("youtubeembed", { src: "https://www.youtube.com/embed/abc" }),
      "YouTubeEmbed",
    );
  });

  it("restores figure only when it carries Figure component props", () => {
    assert.equal(
      restoreMdxComponentTagName("figure", { src: "/images/example.png", alt: "Example" }),
      "Figure",
    );
    assert.equal(restoreMdxComponentTagName("figure", {}), "figure");
  });
});

describe("Worker markdown pipeline", () => {
  it("keeps YouTubeEmbed and Figure as components and does not swallow following headings", () => {
    const source = preprocessPostMarkdown(
      [
        `<YouTubeEmbed src="https://www.youtube.com/embed/Y7NQSB99DJ8" width="560" height="315" title="VSTS Overview - 01 - Account" duration={459} />`,
        "",
        "## Team Projects",
        "",
        `<Figure src="/images/example.png" alt="Example" caption="A caption" />`,
        "",
        "More text.",
        "",
        `<YouTubeEmbed style="margin-bottom: 5px; max-width: 100%; border: #ccc 1px solid;" src="//www.slideshare.net/slideshow/embed_code/key/2vWRtvxZ3k0hIa" width="960" height="540" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" allowfullscreen="allowfullscreen"> </YouTubeEmbed>`,
      ].join("\n"),
    );
    const tree = processToHast(source);
    const tags = collectTagNames(tree);
    assert.equal(tags.filter((tag) => tag === "YouTubeEmbed").length, 2);
    assert.equal(tags.filter((tag) => tag === "youtubeembed").length, 0);
    assert.equal(tags.filter((tag) => tag === "Figure").length, 1);
    assert.ok(tags.includes("h2"), `expected h2 in ${tags.join(",")}`);

    const firstEmbed = findElement(tree, "YouTubeEmbed");
    assert.equal(
      firstEmbed?.properties?.src,
      "https://www.youtube.com/embed/Y7NQSB99DJ8",
    );
    assert.equal(firstEmbed?.properties?.title, "VSTS Overview - 01 - Account");
    assert.equal(firstEmbed?.properties?.duration, "459");

    const heading = findElement(tree, "h2");
    const headingText = JSON.stringify(heading);
    assert.match(headingText, /Team Projects/);

    const figure = findElement(tree, "Figure");
    assert.equal(figure?.properties?.src, "/images/example.png");
    assert.equal(figure?.properties?.caption, "A caption");

    const slideshare = [...collectAll(tree, "YouTubeEmbed")].at(1);
    assert.match(String(slideshare?.properties?.src ?? ""), /slideshare\.net/);
  });
});

function collectAll(node: HastNode, tagName: string, found: HastNode[] = []): HastNode[] {
  if (node.type === "element" && node.tagName === tagName) found.push(node);
  for (const child of node.children ?? []) collectAll(child, tagName, found);
  return found;
}
