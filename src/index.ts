import {VNode, VNodeProperties} from 'maquette';

// Interfaces
// ----------

export interface Query {
  execute(): VNode;
  exists(): boolean;
  query: (selector: string | VNodePredicate, fakeDomNode?: Object) => Query;
  queryAll: (selector: string | VNodePredicate) => CollectionQuery;
  textContent: string;
  vnodeSelector: string;
  properties: VNodeProperties;
  getChild(index: number): Query;
  children: VNode[];
  simulate: Simulator;
}

export interface CollectionQuery {
  execute(): VNode[];
  getResult(index: number): Query;
}

export interface TestProjector extends Query {
  initialize: (renderMaquette: () => VNode) => void;
}

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
  keyPress: (keyCodeOrChar: number | string, valueBefore: string, valueAfter: string, targetElement?: any) => void;
}

export type VNodePredicate = (vnode: VNode) => boolean;

// Helper functions
// ----------------

let makeSelectorFunction = (selector: string | VNodePredicate): VNodePredicate => {
  if (typeof selector === 'string') {
    return (vNode: VNode) => {
      let index = vNode.vnodeSelector.indexOf(selector);
      if ((selector[0] === '.' || selector[0] === '#') ? (index > 0) : (index === 0)) {
        let nextChar = vNode.vnodeSelector.charAt(index + selector.length);
        return !nextChar || nextChar === '.' || nextChar === '#';
      }
      return false;
    };
  } else if (typeof selector === 'function') {
    return selector;
  } else {
    throw new Error('Invalid selector ' + selector);
  }
};

let filterDescendants = (root: VNode, predicate: VNodePredicate): VNode[] => {
  let results: VNode[] = [];
  let visit = (vnodeTree: VNode) => {
    if (vnodeTree.children) {
      vnodeTree.children.forEach((child: VNode) => {
        if (predicate(child)) {
          results.push(child);
        }
        visit(child);
      });
    }
  };
  visit(root);
  return results;
};

// Simulator

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

let createSimulator = (vnode: VNode, defaultFakeDomNode?: Object): Simulator => {
  let properties = vnode.properties;
  return {

    keyDown: (keyCode: number, fakeDomNode?: Object) => {
      let event = createKeyEvent(keyCode, fakeDomNode || defaultFakeDomNode);
      properties.onkeydown(event);
      return event;
    },

    keyUp: (keyCode: number, fakeDomNode?: Object) => {
      let event = createKeyEvent(keyCode, fakeDomNode || defaultFakeDomNode);
      properties.onkeyup(event);
      return event;
    },

    mouseDown: (fakeDomNode?: Object, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(fakeDomNode || defaultFakeDomNode, parameters);
      properties.onmousedown(event);
      return event;
    },

    mouseUp: (fakeDomNode?: Object, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(fakeDomNode || defaultFakeDomNode, parameters);
      properties.onmouseup(event);
      return event;
    },

    click: (fakeDomNode?: Object, parameters?: MouseEventParameters) => {
      let event = createMouseEvent(fakeDomNode || defaultFakeDomNode, parameters);
      properties.onclick(event);
      return event;
    },

    input: (fakeDomNode?: Object) => {
      let event = createEvent(fakeDomNode || defaultFakeDomNode);
      properties.oninput(event);
      return event;
    },

    change: (fakeDomNode?: Object) => {
      let event = createEvent(fakeDomNode || defaultFakeDomNode);
      properties.onchange(event);
      return event;
    },

    focus: (fakeDomNode?: Object) => {
      let event = createFocusEvent(fakeDomNode || defaultFakeDomNode);
      properties.onfocus(event);
      return event;
    },

    blur: (fakeDomNode?: Object) => {
      let event = createFocusEvent(fakeDomNode || defaultFakeDomNode);
      properties.onblur(event);
      return event;
    },

    keyPress: (keyCodeOrChar: number | string, valueBefore: string, valueAfter: string, fakeDomNode?: Object) => {
      let target = (fakeDomNode || defaultFakeDomNode || {}) as { value: string };
      let keyCode = typeof keyCodeOrChar === 'number' ? keyCodeOrChar : keyCodeOrChar.charCodeAt(0);
      target.value = valueBefore;
      if (properties.onkeydown) {
        properties.onkeydown(createKeyEvent(keyCode, target));
      }
      target.value = valueAfter;
      if (properties.onkeyup) {
        properties.onkeyup(createKeyEvent(keyCode, target));
      }
      if (properties.oninput) {
        properties.oninput(createEvent(target));
      }
    }

  };
};

// The create methods

let createCollectionQuery: (getVNodes: () => VNode[]) => CollectionQuery;

let createQuery = (getVNode: () => VNode): Query => {
  let query = (selector: string | VNodePredicate, fakeDomNode?: Object) => {
    let predicate = makeSelectorFunction(selector);
    return createQuery(() => filterDescendants(getVNode(), predicate)[0]);
  };
  let queryAll = (selector: string | VNodePredicate) => {
    let predicate = makeSelectorFunction(selector);
    return createCollectionQuery(() => filterDescendants(getVNode(), predicate));
  };
  let getResult = () => {
    let result = getVNode();
    if (!result) {
      throw new Error('Query did not match a VNode');
    }
    return result;
  };
  return {
    execute: getVNode,
    exists: () => !!getVNode(),
    query,
    queryAll,
    get textContent(): string {
      return collectTextContent(getResult(), []).join('');
    },
    get vnodeSelector(): string {
      return getResult().vnodeSelector;
    },
    get properties(): VNodeProperties {
      return getResult().properties;
    },
    get children(): VNode[] {
      return getResult().children;
    },
    getChild: (index: number) => {
      return createQuery(() => {
        return getResult().children[index];
      });
    },
    /**
     * A small facade that allows firing of simple events and sequences of events for common usecases.
     * It is not meant to be exhaustive.
     * If you need to simulate something that is not in here, you can simply invoke query(...).properties.on???() yourself.
     */
    get simulate(): Simulator { return createSimulator(getResult()); }
  };
};

createCollectionQuery = (getVNodes: () => VNode[]): CollectionQuery => {
  return {
    execute: getVNodes,
    getResult: (index) => {
      return createQuery(() => {
        return getVNodes()[index];
      });
    }
  };
};

/**
 * Creates a test projector which implements the Query interface
 * @param renderMaquetteFunction The renderMaquette function that is used to produce the VNode tree.
 * Optional, when not specified, you must use the initialize function to supply the renderMaquetteFunction.
 */
export let createTestProjector = (renderMaquetteFunction?: () => VNode): TestProjector => {
  let createVNode = () => {
    if (!renderMaquetteFunction) {
      throw new Error('TestProjector was not initialized');
    }
    return renderMaquetteFunction();
  };
  let initialize = (initializeRenderMaquetteFunction: () => VNode) => {
    renderMaquetteFunction = initializeRenderMaquetteFunction;
  };
  let result = createQuery(createVNode) as TestProjector;
  result.initialize = initialize;
  return result;
};
