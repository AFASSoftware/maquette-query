import {expect, sinon} from './test-utilities';
import {h, VNode} from 'maquette';
import {query} from '../src/index';

describe('query', () => {

  describe('selector', () => {

    let tree = h('div', [
      h('span.classA.classB#id1'),
      h('span.classA'),
      h('p.classC#id2')
    ]);

    it('can find an element by className', () => {
      expect(query(tree).find('.classC')).to.deep.include({vnodeSelector: 'p.classC#id2'});
      expect(query(tree).find('.classA')).to.deep.include({vnodeSelector: 'span.classA.classB#id1'});
    });

    it('can find an element by tagname', () => {
      expect(query(tree).find('p')).to.deep.include({vnodeSelector: 'p.classC#id2'});
      expect(query(tree).find('span')).to.deep.include({vnodeSelector: 'span.classA.classB#id1'});
    });

    it('can find an element by id', () => {
      expect(query(tree).find('#id2')).to.deep.include({vnodeSelector: 'p.classC#id2'});
      expect(query(tree).find('#id1')).to.deep.include({vnodeSelector: 'span.classA.classB#id1'});
    });

    it('can find all elements by className', () => {
      let results = query(tree).findAll('.classA');
      expect(results).to.have.length(2);
      expect(results[0]).to.deep.include({vnodeSelector: 'span.classA.classB#id1'});
      expect(results[1]).to.deep.include({vnodeSelector: 'span.classA'});
    });

    it('can find an element using a predicate function', () => {
      let result = query(tree).find((vnode: VNode) => vnode.vnodeSelector.indexOf('#') === -1);
      expect(result.vnodeSelector).to.equal('span.classA');
    });

    it('throws an error for invalid selectors', () => {
      expect(() => {
        query(tree).find(<any>5);
      }).to.throw();
    });

  });

  describe('textContent', () => {

    it('returns the sole text content of a vnode', () => {
      expect(query(h('button', ['Click me'])).textContent).to.equal('Click me');
    });

    it('returns text segments of a vnode and its descendants', () => {
      expect(query(h('p', [
        'A ',
        h('i', ['funny']),
        ' tale'
        ])
      ).textContent).to.equal('A funny tale');
    });

  });

});
