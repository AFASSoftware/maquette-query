import {VNode, VNodeProperties} from 'maquette';

export interface MouseEventParameters {
  pageX?: number;
  pageY?: number;
}

export interface Simulator {
  keyDown: (keyCode: number, targetElement?: any) => KeyboardEvent;
  keyUp: (keyCode: number, targetElement?: any) => KeyboardEvent;
  mouseDown: (targetElement: any, parameters?: MouseEventParameters) => MouseEvent;
  mouseUp: (targetElement: any, parameters?: MouseEventParameters) => MouseEvent;
  click: (targetElement: any, parameters?: MouseEventParameters) => MouseEvent;
  input: (targetElement: any) => Event;
  change: (targetElement: any) => Event;
  focus: (targetElement?: any) => Event;
  blur: (targetElement?: any) => Event;
  keyPress: (keyCodeOrChar: number|string, valueBefore: string, valueAfter: string, targetElement?: any) => void;
}

type VNodePredicate = (vnode: VNode) => boolean;

export interface MaquetteQuery {
  findAll: (selector: string|VNodePredicate) => MaquetteQuery[];
  find: (selector: string|VNodePredicate) => MaquetteQuery;
  textContent: string;
  vnodeSelector: string;
  properties: VNodeProperties;
  children: MaquetteQuery[];
  simulate: Simulator;
}

let makeSelectorFunction = (selector: string): VNodePredicate => {
  if (typeof selector === 'function') {
    return <any>selector;
  }
  if (typeof selector === 'string') {
    return (vNode: VNode) => {
      let index = vNode.vnodeSelector.indexOf(selector);
      if ((selector[0] === '.' || selector[0] === '#') ? (index > 0) : (index === 0)) {
        let nextChar = vNode.vnodeSelector.charAt(index + selector.length);
        return !nextChar || nextChar === '.' || nextChar === '#';
      }
      return false;
    };
  }
  throw new Error('Invalid selector ' + selector);
};

export let query: (vnodeTree: VNode) => MaquetteQuery;

let findAll = (selector: VNodePredicate, vnodeTree: VNode, results: MaquetteQuery[]): MaquetteQuery[] => {
  if (vnodeTree.children) {
    vnodeTree.children.forEach((child: VNode) => {
      if (selector(child)) {
        results.push(query(child));
      }
      findAll(selector, child, results);
    });
  }
  return results;
};

let collectTextContent = (vnodeTree: VNode, results: string[]): string[] => {
  if (vnodeTree.vnodeSelector === '') {
    results.push((<any>vnodeTree).text);
  } else {
    if ((<any>vnodeTree).text) {
      results.push((<any>vnodeTree).text);
    }
    if (vnodeTree.children) {
      vnodeTree.children.forEach((child: any): any => {
        collectTextContent(child, results);
      });
    }
  }
  return results;
};

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
    target
  };
  return <any>result;
};

let createKeyEvent = (which: number, target: any): KeyboardEvent => {
  let event = <any>createEvent(target);
  event.which = which;
  return event;
};

let createMouseEvent = (target: any, parameters?: MouseEventParameters): MouseEvent => {
  let event = <any>createEvent(target);
  if (parameters) {
    event.pageX = parameters.pageX;
    event.pageY = parameters.pageY;
  }
  return event;
};

let createFocusEvent = (target: any): FocusEvent => {
  return <any>createEvent(target);
};

let createSimulator = (vnode: VNode): Simulator => {
  let properties = vnode.properties;
  return {

    keyDown: (keyCode: number, targetElement: any) => {
      let event = createKeyEvent(keyCode, targetElement);
      properties.onkeydown(event);
      return event;
    },

    keyUp: (keyCode: number, targetElement: any) => {
      let event = createKeyEvent(keyCode, targetElement);
      properties.onkeyup(event);
      return event;
    },

    mouseDown: (targetElement: any, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(targetElement, parameters);
      properties.onmousedown(event);
      return event;
    },

    mouseUp: (targetElement: any, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(targetElement, parameters);
      properties.onmouseup(event);
      return event;
    },

    click: (targetElement: any, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(targetElement, parameters);
      properties.onclick(event);
      return event;
    },

    input: (targetElement: any) => {
      let event = createEvent(targetElement);
      properties.oninput(event);
      return event;
    },

    change: (targetElement: any) => {
      let event = createEvent(targetElement);
      properties.onchange(event);
      return event;
    },

    focus: (targetElement?: any) => {
      let event = createFocusEvent(targetElement);
      properties.onfocus(event);
      return event;
    },

    blur: (targetElement?: any) => {
      let event = createFocusEvent(targetElement);
      properties.onblur(event);
      return event;
    },

    keyPress: (keyCodeOrChar: number|string, valueBefore: string, valueAfter: string, targetElement?: any) => {
      let keyCode = typeof keyCodeOrChar === 'number' ? keyCodeOrChar : keyCodeOrChar.charCodeAt(0);
      targetElement = targetElement || {};
      targetElement.value = valueBefore;
      if (properties.onkeydown) {
        properties.onkeydown(createKeyEvent(keyCode, targetElement));
      }
      targetElement.value = valueAfter;
      if (properties.onkeyup) {
        properties.onkeyup(createKeyEvent(keyCode, targetElement));
      }
      if (properties.oninput) {
        properties.oninput(createEvent(targetElement));
      }
    }

  };
};

query = (vnodeTree: VNode): MaquetteQuery => {
  let children = undefined as MaquetteQuery[];
  return {
    findAll: (selector: string) => {
      return findAll(makeSelectorFunction(selector), vnodeTree, []);
    },
    find: (selector: string) => {
      return findAll(makeSelectorFunction(selector), vnodeTree, [])[0];
    },
    get textContent(): string {
      return collectTextContent(vnodeTree, []).join('');
    },
    vnodeSelector: vnodeTree.vnodeSelector,
    properties: vnodeTree.properties,
    get children() { return children || (children = vnodeTree.children.map(query)); }, // lazyness is by design
    /**
     * A small facade that allows firing of simple events and sequences of events for common usecases.
     * It is not meant to be exhaustive.
     * If you need to simulate something that is not in here, you can simply invoke the query(...).properties.on???() yourself.
     */
    get simulate(): Simulator { return createSimulator(vnodeTree); }
  };
};
