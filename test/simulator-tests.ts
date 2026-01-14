import { VNode, VNodeProperties, h } from "maquette";
import { describe, expect, it, vi } from "vitest";

import { createTestProjector } from "../src/test-projector.js";

describe("simulator", () => {
  let createQuery = (vnode: VNode) => {
    return createTestProjector(() => vnode).root;
  };

  let simulateAllEvents = (vnode: VNode) => {
    let { simulate } = createQuery(vnode);
    simulate.blur();
    simulate.change();
    simulate.click();
    simulate.focus();
    simulate.input();
    simulate.keyDown(0);
    simulate.keyUp(0);
    simulate.keyPress(0, "before", "after");
    simulate.mouseDown();
    simulate.mouseOut();
    simulate.mouseOver();
    simulate.mouseUp();
    simulate.mouseWheel({});
  };

  it("can simulate input", () => {
    let handleInput = vi.fn();
    let vnode = h("input", { type: "text", oninput: handleInput });
    createQuery(vnode).simulate.input({ value: "Text1" });
    expect(handleInput).toHaveBeenCalledWith(
      expect.objectContaining({ target: { value: "Text1" } })
    );
  });

  it("can simulate blur", () => {
    let element = {};
    let handleBlur = vi.fn();
    let vnode = h("input", { type: "text", onblur: handleBlur });
    createQuery(vnode).simulate.blur(element);
    expect(handleBlur).toHaveBeenCalledWith(expect.objectContaining({ target: element }));
  });

  it("can simulate focus", () => {
    let element = {};
    let handleFocus = vi.fn();
    let vnode = h("input", { type: "text", onfocus: handleFocus });
    createQuery(vnode).simulate.focus(element);
    expect(handleFocus).toHaveBeenCalledWith(expect.objectContaining({ target: element }));
  });

  it("can simulate change", () => {
    let element = {};
    let handleChange = vi.fn();
    let vnode = h("input", { type: "text", onchange: handleChange });
    createQuery(vnode).simulate.change(element);
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ target: element }));
  });

  it("can simulate keyDown", () => {
    let element = {};
    let handleKeyDown = vi.fn();
    let vnode = h("input", { type: "text", onkeydown: handleKeyDown });
    createQuery(vnode).simulate.keyDown(13, element);
    expect(handleKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ which: 13, target: element })
    );
  });

  it("can simulate keyDown with a character", () => {
    let element = {};
    let handleKeyDown = vi.fn();
    let vnode = h("input", { type: "text", onkeydown: handleKeyDown });
    createQuery(vnode).simulate.keyDown("a", element);
    expect(handleKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ which: 97, target: element })
    );
  });

  it("can simulate keyUp", () => {
    let element = {};
    let handleKeyUp = vi.fn();
    let vnode = h("input", { type: "text", onkeyup: handleKeyUp });
    createQuery(vnode).simulate.keyUp(13, element);
    expect(handleKeyUp).toHaveBeenCalledWith(
      expect.objectContaining({ which: 13, target: element })
    );
  });

  it("can simulate mouseDown", () => {
    let element = {};
    let handleMouseDown = vi.fn();
    let vnode = h("input", { type: "text", onmousedown: handleMouseDown });
    createQuery(vnode).simulate.mouseDown(element, { pageX: 100, pageY: 200 });
    expect(handleMouseDown).toHaveBeenCalledWith(
      expect.objectContaining({ target: element, pageX: 100, pageY: 200 })
    );
  });

  it("can simulate mouseUp", () => {
    let element = {};
    let handleMouseUp = vi.fn();
    let vnode = h("input", { type: "text", onmouseup: handleMouseUp });
    createQuery(vnode).simulate.mouseUp(element);
    expect(handleMouseUp).toHaveBeenCalledWith(expect.objectContaining({ target: element }));
  });

  it("can simulate mouseOver", () => {
    let element = {};
    let handleMouseOver = vi.fn();
    let vnode = h("input", { type: "text", onmouseover: handleMouseOver });
    createQuery(vnode).simulate.mouseOver(element);
    expect(handleMouseOver).toHaveBeenCalledWith(expect.objectContaining({ target: element }));
  });

  it("can simulate mouseOut", () => {
    let element = {};
    let handleMouseOut = vi.fn();
    let vnode = h("input", { type: "text", onmouseout: handleMouseOut });
    createQuery(vnode).simulate.mouseOut(element);
    expect(handleMouseOut).toHaveBeenCalledWith(expect.objectContaining({ target: element }));
  });

  it("can simulate click", () => {
    let element = {};
    let handleClick = vi.fn();
    let vnode = h("input", { type: "text", onclick: handleClick });
    createQuery(vnode).simulate.click(element);
    expect(handleClick).toHaveBeenCalledWith(expect.objectContaining({ target: element }));
  });

  it("can simulate right mouse button click", () => {
    let element = {};
    let handleClick = vi.fn();
    let vnode = h("input", { type: "text", onclick: handleClick });
    createQuery(vnode).simulate.click(element, { which: 2 });
    let evt: MouseEvent = handleClick.mock.calls[0][0];
    expect(evt.which).toBe(2);
  });

  it("can simulate keypress firing keyDown and keyUp", () => {
    let element = {};
    let handleKeyDown = vi.fn((evt: KeyboardEvent) => {
      expect(evt.which).toBe(97);
      expect(evt.target).toMatchObject({ value: "" });
    });
    let handleKeyUp = vi.fn((evt: KeyboardEvent) => {
      expect(evt.which).toBe(97);
      expect(evt.target).toMatchObject({ value: "a" });
    });
    let vnode = h("input", { type: "text", onkeydown: handleKeyDown, onkeyup: handleKeyUp });
    createQuery(vnode).simulate.keyPress("a", "", "a", element);
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
    expect(handleKeyUp).toHaveBeenCalledTimes(1);
  });

  it("can simulate keypress firing input", () => {
    let handleInput = vi.fn();
    let vnode = h("input", { type: "text", oninput: handleInput });
    createQuery(vnode).simulate.keyPress(97, "", "a");
    expect(handleInput).toHaveBeenCalledWith(expect.objectContaining({ target: { value: "a" } }));
  });

  it("will not set the value and will not fire the input event when the keyDown event has its default prevented", () => {
    let element = { value: "initial" };
    let handleKeyDown = vi.fn((event: KeyboardEvent) => {
      event.preventDefault();
    });
    let handleInput = vi.fn();
    let handleKeyUp = vi.fn();

    let vnode = h("input", {
      type: "text",
      onkeydown: handleKeyDown,
      onkeyup: handleKeyUp,
      oninput: handleInput,
    });
    createQuery(vnode).simulate.keyPress("a", "initial", "should not be this", element);
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
    expect(handleInput).not.toHaveBeenCalled();
    expect(handleKeyUp).toHaveBeenCalledTimes(1);
    expect(element.value).toBe("initial");
  });

  it("creates events which can be instructed to preventDefault", () => {
    let handleClick = (evt: MouseEvent) => {
      evt.preventDefault();
      evt.stopPropagation();
    };
    let vnode = h("input", { type: "text", onclick: handleClick });
    let event = createQuery(vnode).simulate.click({});
    expect(event.defaultPrevented).toBe(true);
    expect((event as any).propagationStopped).toBe(true);
  });

  it("can simulate mousewheel", () => {
    let element = {};
    let handleMouseWheel = vi.fn();
    let vnode = h("div", { onmousewheel: handleMouseWheel });
    createQuery(vnode).simulate.mouseWheel({}, element);
    expect(handleMouseWheel).toHaveBeenCalledWith(expect.objectContaining({ target: element }));
  });

  it("this === vnodeProperties (default)", () => {
    let handler = vi.fn();
    let vnode = h("div", {
      onblur: handler,
      onchange: handler,
      onclick: handler,
      onfocus: handler,
      oninput: handler,
      onkeydown: handler,
      onkeyup: handler,
      onkeypress: handler,
      onmousedown: handler,
      onmouseout: handler,
      onmouseover: handler,
      onmouseup: handler,
      onmousewheel: handler,
    });
    simulateAllEvents(vnode);
    let thisValues = handler.mock.contexts;
    expect(thisValues.every((thisArg: unknown) => thisArg === vnode.properties)).toBe(true);
  });

  it("this === vnodeProperties.bind when provided", () => {
    let handler = vi.fn();
    let vnode = h("div", {
      bind: {},
      onblur: handler,
      onchange: handler,
      onclick: handler,
      onfocus: handler,
      oninput: handler,
      onkeydown: handler,
      onkeyup: handler,
      onkeypress: handler,
      onmousedown: handler,
      onmouseout: handler,
      onmouseover: handler,
      onmouseup: handler,
      onmousewheel: handler,
    });
    simulateAllEvents(vnode);
    let thisValues = handler.mock.contexts;
    expect(thisValues.every((thisArg: VNodeProperties) => thisArg === vnode.properties!.bind)).toBe(
      true
    );
  });
});
