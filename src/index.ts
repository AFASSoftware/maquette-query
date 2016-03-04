import {VNode, VNodeProperties} from 'maquette';

// Interfaces
// ----------

/**
 * A Query defines a way to find a specific VNode.
 *
 * A query is re-executed each time one of its methods is called. It does NOT cache the result.
 */
export interface Query {
  /**
   * Executes the Query and returns the resulting VNode.
   *
   * Throws an Error if a result is not found.
   */
  execute(): VNode;
  /**
   * Executes the query and returns true if a result is found, false otherwise.
   */
  exists(): boolean;
  /**
   * Creates a new Query starting at the result of this query.
   * The resulting query returns the first result that matches the specified selector.
   *
   * @param selector The test that is executed at each descendant of the result of the query.
   * Selector is either a function of a string containing one of the following: a tagname, a dot followed by a className, or a hash followed by an id.
   */
  query: (selector: string | VNodePredicate) => Query;
  /**
   * Creates a new query which matches multiple nodes, starting at the result of this query.
   *
   * @param selector see `query`.
   */
  queryAll: (selector: string | VNodePredicate) => CollectionQuery;
  /**
   * Returns a Query new which returns the child at the specified index of the result of this query.
   */
  getChild(index: number): Query;
  /**
   * Executes the Query and returns the textContent of this node and all of its descendants in the same way as HTMLElement.textContent does.
   */
  textContent: string;
  /**
   * Executes the Query and returns the selector of the resulting VNode.
   */
  vnodeSelector: string;
  /**
   * Executes the Query and returns the properties of the resulting VNode.
   */
  properties: VNodeProperties;
  /**
   * Executes the Query and returns the children of the resulting VNode.
   */
  children: VNode[];
  /**
   * Returns a Simulator for executing common user-interactions. Will invoke `VNode.properties.on???()` callbacks
   */
  simulate: Simulator;
  /**
   * Registers an object to act as the target DOM node of events that are fired using `simulate`.
   */
  setTargetDomNode(fakeDomNode?: Object): void;
}

/**
 * CollectionQuery is a query that yields multiple VNodes.
 */
export interface CollectionQuery {
  /**
   * Executes the query.
   */
  execute(): VNode[];
  /**
   * Creates a new Query that returns the result of this query at the specified index.
   */
  getResult(index: number): Query;
  /**
   * Executes the Query and returns the number of results.
   */
  length: number;
}

/**
 * see `createTestProjector`
 */
export interface TestProjector extends Query {
  initialize: (renderMaquette: () => VNode) => void;
}

export interface MouseEventParameters {
  pageX?: number;
  pageY?: number;
}

/**
 * Returns a Simulator for executing common user-interactions.
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
    event.pageX = parameters.pageX;
    event.pageY = parameters.pageY;
  }
  return event;
};

let createFocusEvent = (target: any): FocusEvent => {
  return <any>createEvent(target);
};

let getKeyCode = (keyCodeOrChar: number | string) => {
  return typeof keyCodeOrChar === 'number' ? keyCodeOrChar : keyCodeOrChar.charCodeAt(0);
};

let createSimulator = (vnode: VNode, defaultFakeDomNode?: Object): Simulator => {
  let properties = vnode.properties;
  return {

    keyDown: (keyCode: number | string, fakeDomNode?: Object) => {
      let event = createKeyEvent(getKeyCode(keyCode), fakeDomNode || defaultFakeDomNode);
      properties.onkeydown(event);
      return event;
    },

    keyUp: (keyCode: number | string, fakeDomNode?: Object) => {
      let event = createKeyEvent(getKeyCode(keyCode), fakeDomNode || defaultFakeDomNode);
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
  let targetDomNode: Object;
  return {
    execute: getResult,
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
    get simulate(): Simulator { return createSimulator(getResult(), targetDomNode); },
    setTargetDomNode: (target) => {
      targetDomNode = target;
    }
  };
};

createCollectionQuery = (getVNodes: () => VNode[]): CollectionQuery => {
  return {
    execute: getVNodes,
    getResult: (index) => {
      return createQuery(() => {
        return getVNodes()[index];
      });
    },
    get length() {
      return getVNodes().length;
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
