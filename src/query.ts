import {VNode, VNodeProperties} from 'maquette';
import {Simulator} from './simulator';

// Interfaces
// ----------

export type VNodePredicate = (vnode: VNode) => boolean;

export interface QueryBase {
  /**
   * Creates a new Query starting at the result of this query.
   * The resulting query returns the first result that matches the specified selector.
   *
   * @param selector The test that is executed at each descendant of the result of the query.
   * Selector is either a function of a string containing one of the following: a tagname, a dot followed by a className, or a hash followed by an id.
   */
  query: (selector: string | VNodePredicate) => NodeQuery;
  /**
   * Creates a new query which matches multiple nodes, starting at the result of this query.
   *
   * @param selector see `query`.
   */
  queryAll: (selector: string | VNodePredicate) => NodeListQuery;
}

/**
 * A Query defines a way to find a specific VNode.
 *
 * A query is re-executed each time one of its methods is called. It does NOT cache the result.
 */
export interface NodeQuery extends QueryBase {
  /**
   * Returns a string representation of the VNode tree and the query.
   */
  debug(): string;
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
   * Returns a Query new which returns the child at the specified index of the result of this query.
   */
  getChild(index: number): NodeQuery;
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
  /**
   * Gets the object registered using setTargetDomNode, as HTMLElement.
   */
  getTargetDomNode(): HTMLElement;
}

/**
 * CollectionQuery is a query that yields multiple VNodes.
 */
export interface NodeListQuery {
  /**
   * Executes the query.
   */
  execute(): VNode[];
  /**
   * Creates a new Query that returns the result of this query at the specified index.
   */
  getResult(index: number): NodeQuery;
  /**
   * Executes the Query and returns the number of results.
   */
  length: number;
}
