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

  it('can simulate blur', () => {
    let element = {};
    let handleBlur = sinon.stub();
    let vnode = h('input', { type: 'text', onblur: handleBlur });
    query(vnode).simulate.blur(element);
    expect(handleBlur).to.be.calledWith(sinon.match({ target: element }));
  });

  it('can simulate focus', () => {
    let element = {};
    let handleFocus = sinon.stub();
    let vnode = h('input', { type: 'text', onfocus: handleFocus });
    query(vnode).simulate.focus(element);
    expect(handleFocus).to.be.calledWith(sinon.match({ target: element }));
  });

  it('can simulate change', () => {
    let element = {};
    let handleChange = sinon.stub();
    let vnode = h('input', { type: 'text', onchange: handleChange });
    query(vnode).simulate.change(element);
    expect(handleChange).to.be.calledWith(sinon.match({ target: element }));
  });

  it('can simulate keyDown', () => {
    let element = {};
    let handleKeyDown = sinon.stub();
    let vnode = h('input', { type: 'text', onkeydown: handleKeyDown });
    query(vnode).simulate.keyDown(13, element);
    expect(handleKeyDown).to.be.calledWith(sinon.match({which: 13, target: element }));
  });

  it('can simulate keyUp', () => {
    let element = {};
    let handleKeyUp = sinon.stub();
    let vnode = h('input', { type: 'text', onkeyup: handleKeyUp });
    query(vnode).simulate.keyUp(13, element);
    expect(handleKeyUp).to.be.calledWith(sinon.match({which: 13, target: element }));
  });

  it('can simulate mouseDown', () => {
    let element = {};
    let handleMouseDown = sinon.stub();
    let vnode = h('input', { type: 'text', onmousedown: handleMouseDown });
    query(vnode).simulate.mouseDown(element, {pageX: 100, pageY: 200});
    expect(handleMouseDown).to.be.calledWith(sinon.match({target: element, pageX: 100, pageY: 200 }));
  });

  it('can simulate mouseUp', () => {
    let element = {};
    let handleMouseUp = sinon.stub();
    let vnode = h('input', { type: 'text', onmouseup: handleMouseUp });
    query(vnode).simulate.mouseUp(element);
    expect(handleMouseUp).to.be.calledWith(sinon.match({target: element }));
  });

});
