import { VNode, h } from "maquette";
import { beforeEach, describe, expect, it } from "vitest";

import { createTestProjector } from "../src/test-projector.js";

describe("query", () => {
  // Convenience method for these tests
  let createQuery = (vnode: VNode) => {
    return createTestProjector(() => vnode).root;
  };

  describe("selector", () => {
    let tree!: VNode;

    beforeEach(() => {
      tree = h("div", [h("span.classA.classB#id1"), h("span.classA"), h("p.classC#id2")]);
    });

    it("can find an element by className", () => {
      expect(createQuery(tree).query(".classC")).toMatchObject({ vnodeSelector: "p.classC#id2" });
      expect(createQuery(tree).query(".classA")).toMatchObject({
        vnodeSelector: "span.classA.classB#id1",
      });
    });

    it("can find an element by tagname", () => {
      expect(createQuery(tree).query("p")).toMatchObject({ vnodeSelector: "p.classC#id2" });
      expect(createQuery(tree).query("span")).toMatchObject({
        vnodeSelector: "span.classA.classB#id1",
      });
    });

    it("can find an element by id", () => {
      expect(createQuery(tree).query("#id2")).toMatchObject({ vnodeSelector: "p.classC#id2" });
      expect(createQuery(tree).query("#id1")).toMatchObject({
        vnodeSelector: "span.classA.classB#id1",
      });
    });

    it("can find all elements by className", () => {
      let results = createQuery(tree).queryAll(".classA");
      expect(results.execute()).toHaveLength(2);
      expect(results.getResult(0)).toMatchObject({ vnodeSelector: "span.classA.classB#id1" });
      expect(results.getResult(1)).toMatchObject({ vnodeSelector: "span.classA" });
    });

    it("can find an element using a predicate function", () => {
      let result = createQuery(tree).query(
        (vnode: VNode) => vnode.vnodeSelector.indexOf("#") === -1
      );
      expect(result.vnodeSelector).toBe("span.classA");
    });

    it("throws an error for invalid selectors", () => {
      expect(() => {
        createQuery(tree).query(<any>5);
      }).toThrow();
    });

    it("throws an error when query does not match", () => {
      expect(() => {
        createQuery(tree).query(".nonexistent").execute();
      }).toThrow("Query did not match a VNode");
    });
  });

  describe("textContent", () => {
    it("returns the sole text content of a vnode", () => {
      expect(createQuery(h("button", ["Click me"])).textContent).toBe("Click me");
    });

    it("returns text segments of a vnode and its descendants", () => {
      expect(createQuery(h("p", ["A ", h("i", ["funny"]), " tale"])).textContent).toBe(
        "A funny tale"
      );
    });
  });

  describe("properties and children", () => {
    it("returns empty object when no properties are defined", () => {
      let vnode = h("div");
      expect(createQuery(vnode).properties).toEqual({});
    });

    it("returns properties when defined", () => {
      let vnode = h("div", { id: "test", classes: { active: true } });
      expect(createQuery(vnode).properties.id).toBe("test");
    });

    it("returns empty array when no children are defined", () => {
      let vnode = h("div");
      expect(createQuery(vnode).children).toEqual([]);
    });

    it("returns children when defined", () => {
      let vnode = h("div", [h("span"), h("p")]);
      expect(createQuery(vnode).children).toHaveLength(2);
    });
  });

  describe("exists", () => {
    it("returns true when query matches", () => {
      let vnode = h("div", [h("span.test")]);
      expect(createQuery(vnode).query(".test").exists()).toBe(true);
    });

    it("returns false when query does not match", () => {
      let vnode = h("div", [h("span.test")]);
      expect(createQuery(vnode).query(".nonexistent").exists()).toBe(false);
    });
  });

  describe("debug", () => {
    it("returns debug information as JSON string", () => {
      let vnode = h("div", [h("span.test")]);
      let debugInfo = createQuery(vnode).query(".test").debug();
      expect(debugInfo).toContain(".test");
    });
  });

  describe("getTargetDomNode", () => {
    it("returns undefined when no target is set", () => {
      let vnode = h("div");
      expect(createQuery(vnode).getTargetDomNode()).toBeUndefined();
    });

    it("returns the set target dom node", () => {
      let vnode = h("div");
      let query = createQuery(vnode);
      let target = { id: "fake-dom-node" };
      query.setTargetDomNode(target);
      expect(createQuery(vnode).getTargetDomNode()).toBeUndefined(); // Different instance
    });
  });

  describe("uninitialize", () => {
    it("throws error when projector is uninitialized and root is accessed", () => {
      let projector = createTestProjector(() => h("div"));
      projector.uninitialize();
      expect(() => projector.root.execute()).toThrow("TestProjector is not initialized");
    });
  });

  describe("getChild", () => {
    it("returns a query for the child at specified index", () => {
      let vnode = h("div", [h("span.first"), h("span.second")]);
      let childQuery = createQuery(vnode).getChild(0);
      expect(childQuery.vnodeSelector).toBe("span.first");
    });

    it("can chain getChild with further queries", () => {
      let vnode = h("div", [h("span", [h("p.nested")])]);
      let childQuery = createQuery(vnode).getChild(0);
      expect(childQuery.query(".nested").vnodeSelector).toBe("p.nested");
    });
  });

  describe("queryAll getResult", () => {
    it("returns a query for the result at specified index", () => {
      let vnode = h("div", [h("span.test"), h("span.test")]);
      let results = createQuery(vnode).queryAll(".test");
      // Access the result to trigger the lazy evaluation
      expect(results.getResult(1).vnodeSelector).toBe("span.test");
    });

    it("provides debug info for queryAll results", () => {
      let vnode = h("div", [h("span.test"), h("span.test")]);
      let results = createQuery(vnode).queryAll(".test");
      let debugInfo = results.getResult(0).debug();
      expect(debugInfo).toContain("result:0");
    });

    it("returns the length of queryAll results", () => {
      let vnode = h("div", [h("span.test"), h("span.test"), h("span.test")]);
      let results = createQuery(vnode).queryAll(".test");
      expect(results.length).toBe(3);
    });
  });
});
