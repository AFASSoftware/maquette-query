import {expect} from './test-utilities';
import {h} from 'maquette';
import {createTestProjector} from '../src/test-projector';

describe('descendants', () => {
  it('can query nodes in the tree of descendants', () => {
    let vnode = h('div', [
      h('div.here'),
      h('div', [
        h('div.here.too'),
        h('div.and.here.too')
      ])
    ]);
    let results = createTestProjector(() => vnode).queryAll('.here');
    expect(results.execute()).to.have.length(3);
    expect(results.getResult(0).vnodeSelector).to.equal('div.here');
    expect(results.getResult(1).vnodeSelector).to.equal('div.here.too');
    expect(results.getResult(2).vnodeSelector).to.equal('div.and.here.too');
  });

  it('returns children as an array of VNode objects and getChild as a Query object', () => {
    let vnode = h('div', [h('span', ['text'])]);
    let projector = createTestProjector(() => vnode);
    let children = projector.root.children;
    expect(children).to.have.length(1);
    expect(projector.root.getChild(0)).to.respondTo('queryAll');
  });
});
