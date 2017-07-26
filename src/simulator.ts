import {VNode} from 'maquette';

/**
 * Simulator to execute common user-interactions. Provides convenient wrappers for VNode.properties.on??? calls.
 */
export interface Simulator {
  /**
   * Will invoke VNode.properties.onkeydown
   */
  keyDown: (keyCode: number | string, targetElement?: any) => KeyboardEvent;
  /**
   * Will invoke VNode.properties.onkeyup
   */
  keyUp: (keyCode: number | string, targetElement?: any) => KeyboardEvent;
  /**
   * Will invoke VNode.properties.onmousedown
   */
  mouseDown: (targetElement?: any, parameters?: MouseEventParameters) => MouseEvent;
  /**
   * Will invoke VNode.properties.onmouseup
   */
  mouseUp: (targetElement?: any, parameters?: MouseEventParameters) => MouseEvent;
  /**
   * Will invoke VNode.properties.onmouseover
   */
  mouseOver: (targetElement?: any, parameters?: MouseEventParameters) => MouseEvent;
  /**
   * Will invoke VNode.properties.onmouseout
   */
  mouseOut: (targetElement?: any, parameters?: MouseEventParameters) => MouseEvent;
  /**
   * Will invoke VNode.properties.onclick
   */
  click: (targetElement?: any, parameters?: MouseEventParameters) => MouseEvent;
  /**
   * Will invoke VNode.properties.oninput
   */
  input: (targetElement?: any) => Event;
  /**
   * Will invoke VNode.properties.onchange
   */
  change: (targetElement?: any) => Event;
  /**
   * Will invoke VNode.properties.onfocus
   */
  focus: (targetElement?: any) => Event;
  /**
   * Will invoke VNode.properties.onblur
   */
  blur: (targetElement?: any) => Event;
  /**
   * Will invoke VNode.properties.onkeydown, VNode.properties.onkeyup, VNode.properties.onkeypress and VNode.properties.oninput
   */
  keyPress: (keyCodeOrChar: number | string, valueBefore: string, valueAfter: string, targetElement?: any) => void;
  /**
   * Will invoke VNode.properties.onmousewheel
   */
  mouseWheel: (deltas: {deltaX?: number, deltaY?: number}, targetElement?: any) => Event;
}

export interface MouseEventParameters {
  pageX?: number;
  pageY?: number;
  which?: number;
  metaKey?: boolean;
  ctrlKey?: boolean;
  [key: string]: any;
}

let createEvent = (target: any): Event => {
  let result = {
    defaultPrevented: false,
    propagationStopped: false,
    preventDefault: () => {
      result.defaultPrevented = true;
    },
    stopPropagation: () => {
      result.propagationStopped = true;
    },
    target,
    currentTarget: target
  };
  return <any>result;
};

let createKeyEvent = (which: number, target: any): KeyboardEvent => {
  let event = <any>createEvent(target);
  event.which = which;
  event.keyCode = which;
  return event;
};

let createMouseEvent = (target: any, parameters?: MouseEventParameters): MouseEvent => {
  let event = <any>createEvent(target);
  if (parameters) {
    Object.keys(parameters).forEach(param => {event[param] = parameters[param]});
  }
  return event;
};

let createFocusEvent = (target: any): FocusEvent => {
  return <any>createEvent(target);
};

let getKeyCode = (keyCodeOrChar: number | string) => {
  return typeof keyCodeOrChar === 'number' ? keyCodeOrChar : keyCodeOrChar.charCodeAt(0);
};

export let createSimulator = (vnode: VNode, defaultFakeDomNode?: Object): Simulator => {
  let properties = vnode.properties!;
  return {

    keyDown: (keyCode: number | string, fakeDomNode?: Object) => {
      let event = createKeyEvent(getKeyCode(keyCode), fakeDomNode || defaultFakeDomNode);
      properties.onkeydown!.call(properties.bind || properties, event);
      return event;
    },

    keyUp: (keyCode: number | string, fakeDomNode?: Object) => {
      let event = createKeyEvent(getKeyCode(keyCode), fakeDomNode || defaultFakeDomNode);
      properties.onkeyup!.call(properties.bind || properties, event);
      return event;
    },

    mouseDown: (fakeDomNode?: Object, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(fakeDomNode || defaultFakeDomNode, parameters);
      properties.onmousedown!.call(properties.bind || properties, event);
      return event;
    },

    mouseUp: (fakeDomNode?: Object, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(fakeDomNode || defaultFakeDomNode, parameters);
      properties.onmouseup!.call(properties.bind || properties, event);
      return event;
    },

    mouseOver: (fakeDomNode?: Object, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(fakeDomNode || defaultFakeDomNode, parameters);
      properties.onmouseover!.call(properties.bind || properties, event);
      return event;
    },

    mouseOut: (fakeDomNode?: Object, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(fakeDomNode || defaultFakeDomNode, parameters);
      properties.onmouseout!.call(properties.bind || properties, event);
      return event;
    },

    click: (fakeDomNode?: Object, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(fakeDomNode || defaultFakeDomNode, parameters);
      properties.onclick!.call(properties.bind || properties, event);
      return event;
    },

    input: (fakeDomNode?: Object) => {
      let event = createEvent(fakeDomNode || defaultFakeDomNode);
      properties.oninput!.call(properties.bind || properties, event);
      return event;
    },

    change: (fakeDomNode?: Object) => {
      let event = createEvent(fakeDomNode || defaultFakeDomNode);
      properties.onchange!.call(properties.bind || properties, event);
      return event;
    },

    focus: (fakeDomNode?: Object) => {
      let event = createFocusEvent(fakeDomNode || defaultFakeDomNode);
      properties.onfocus!.call(properties.bind || properties, event);
      return event;
    },

    blur: (fakeDomNode?: Object) => {
      let event = createFocusEvent(fakeDomNode || defaultFakeDomNode);
      properties.onblur!.call(properties.bind || properties, event);
      return event;
    },

    keyPress: (keyCodeOrChar: number | string, valueBefore: string, valueAfter: string, fakeDomNode?: Object) => {
      let target = (fakeDomNode || defaultFakeDomNode || {}) as { value: string };
      let keyCode = typeof keyCodeOrChar === 'number' ? keyCodeOrChar : keyCodeOrChar.charCodeAt(0);
      target.value = valueBefore;
      let keyDownEvent = createKeyEvent(keyCode, target);
      if (properties.onkeydown) {
        properties.onkeydown.call(properties.bind || properties, keyDownEvent);
      }

      if (!keyDownEvent.defaultPrevented) {
        target.value = valueAfter;
        if (properties.oninput) {
          properties.oninput.call(properties.bind || properties, createEvent(target));
        }
      }

      if (properties.onkeyup) {
        properties.onkeyup.call(properties.bind || properties, createKeyEvent(keyCode, target));
      }
    },

    mouseWheel: (deltas: {deltaX?: number, deltaY?: number}, fakeDomNode?: Object) => {
      let event = createEvent(fakeDomNode || defaultFakeDomNode) as any;
      event.deltaX = deltas.deltaX;
      event.deltaY = deltas.deltaY;
      properties.onmousewheel!.call(properties.bind || properties, event);
      return event;
    }

  };
};
