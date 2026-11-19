import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Mirrors `useTina`'s data effect: whenever the seed object identity changes,
 * displayed data is reset to that seed. The visual-editor preview must keep a
 * stable seed so live `updateData` from the admin is not wiped on re-render.
 */
function simulateUseTina(getSeed: () => object) {
  let processedRef: object | undefined;
  let data: object | undefined;

  const render = () => {
    const seed = getSeed();
    if (data === undefined) data = seed;
    if (seed !== processedRef) {
      data = seed;
      processedRef = seed;
    }
  };

  return {
    render,
    applyUpdate(next: object) {
      data = next;
    },
    get data() {
      return data;
    },
  };
}

describe("useTina preview seed identity", () => {
  it("drops live document data when the seed is recreated every render", () => {
    const tina = simulateUseTina(() => ({ post: { title: "" } }));
    tina.render();
    tina.applyUpdate({ post: { title: "This Week in Developer Tech · W07" } });
    tina.render();
    assert.equal((tina.data as { post: { title: string } }).post.title, "");
  });

  it("keeps live document data when the seed stays referentially stable", () => {
    const seed = { post: { title: "" } };
    const tina = simulateUseTina(() => seed);
    tina.render();
    tina.applyUpdate({ post: { title: "This Week in Developer Tech · W07" } });
    tina.render();
    assert.equal(
      (tina.data as { post: { title: string } }).post.title,
      "This Week in Developer Tech · W07",
    );
  });
});
