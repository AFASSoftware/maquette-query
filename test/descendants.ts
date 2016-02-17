import {expect} from './test-utilities';
import {h} from 'maquette';
import {query} from '../src/index';

describe('descendants', () => {
  it('can query nodes in the tree of descendants', () => {
    let vnode = h('div', [
      h('div.here'),
      h('div', [
        h('div.here.too'),
        h('div.and.here.too')
      ])
    ]);
    let results = query(vnode).findAll('.here');
    expect(results).to.have.length(3);
    expect(results[0].vnodeSelector).to.equal('div.here');
    expect(results[1].vnodeSelector).to.equal('div.here.too');
    expect(results[2].vnodeSelector).to.equal('div.and.here.too');
  });

  it('returns children as an array of MaquetteQuery objects', () => {
    let vnode = h('div', [h('span', ['text'])]);
    let children = query(vnode).children;
    expect(children).to.have.length(1);
    expect(children[0]).to.respondTo('findAll');
  });
});
