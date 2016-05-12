import {expect} from './test-utilities';
import {h, VNode} from 'maquette';
import {createTestProjector} from '../src/test-projector';

describe('query', () => {

  // Convenience method for these tests
  let createQuery = (vnode: VNode) => {
    return createTestProjector(() => vnode).root;
  };

  describe('selector', () => {

    let tree = h('div', [
      h('span.classA.classB#id1'),
      h('span.classA'),
      h('p.classC#id2')
    ]);

    it('can find an element by className', () => {
      expect(createQuery(tree).query('.classC')).to.deep.include({ vnodeSelector: 'p.classC#id2' });
      expect(createQuery(tree).query('.classA')).to.deep.include({ vnodeSelector: 'span.classA.classB#id1' });
    });

    it('can find an element by tagname', () => {
      expect(createQuery(tree).query('p')).to.deep.include({ vnodeSelector: 'p.classC#id2' });
      expect(createQuery(tree).query('span')).to.deep.include({ vnodeSelector: 'span.classA.classB#id1' });
    });

    it('can find an element by id', () => {
      expect(createQuery(tree).query('#id2')).to.deep.include({ vnodeSelector: 'p.classC#id2' });
      expect(createQuery(tree).query('#id1')).to.deep.include({ vnodeSelector: 'span.classA.classB#id1' });
    });

    it('can find all elements by className', () => {
      let results = createQuery(tree).queryAll('.classA');
      expect(results.execute()).to.have.length(2);
      expect(results.getResult(0)).to.deep.include({ vnodeSelector: 'span.classA.classB#id1' });
      expect(results.getResult(1)).to.deep.include({ vnodeSelector: 'span.classA' });
    });

    it('can find an element using a predicate function', () => {
      let result = createQuery(tree).query((vnode: VNode) => vnode.vnodeSelector.indexOf('#') === -1);
      expect(result.vnodeSelector).to.equal('span.classA');
    });

    it('throws an error for invalid selectors', () => {
      expect(() => {
        createQuery(tree).query(<any>5);
      }).to.throw();
    });

  });

  describe('textContent', () => {

    it('returns the sole text content of a vnode', () => {
      expect(createQuery(h('button', ['Click me'])).textContent).to.equal('Click me');
    });

    it('returns text segments of a vnode and its descendants', () => {
      expect(createQuery(h('p', [
        'A ',
        h('i', ['funny']),
        ' tale'
      ])
      ).textContent).to.equal('A funny tale');
    });

  });

});
