import { h } from "maquette";
import { describe, expect, it } from "vitest";

import { createTestProjector } from "../src/test-projector.js";

describe("descendants", () => {
  it("can query nodes in the tree of descendants", () => {
    let vnode = h("div", [h("div.here"), h("div", [h("div.here.too"), h("div.and.here.too")])]);
    let results = createTestProjector(() => vnode).queryAll(".here");
    expect(results.execute()).toHaveLength(3);
    expect(results.getResult(0).vnodeSelector).toBe("div.here");
    expect(results.getResult(1).vnodeSelector).toBe("div.here.too");
    expect(results.getResult(2).vnodeSelector).toBe("div.and.here.too");
  });

  it("returns children as an array of VNode objects and getChild as a Query object", () => {
    let vnode = h("div", [h("span", ["text"])]);
    let projector = createTestProjector(() => vnode);
    let children = projector.root.children;
    expect(children).toHaveLength(1);
    expect(projector.root.getChild(0).queryAll).toBeDefined();
  });
});
