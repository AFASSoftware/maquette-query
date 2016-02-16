import {expect, sinon} from './test-utilities';
import {h} from 'maquette';
import {query} from '../src/index';

describe('simulator', () => {
  it('can simulate input', () => {
    let handleInput = sinon.stub();
    let vnode = h('input', { type: 'text', oninput: handleInput });
    query(vnode).simulate.input({ value: 'Text1' });
    expect(handleInput).to.be.calledWith(sinon.match({ target: { value: 'Text1' } }));
  });
});
