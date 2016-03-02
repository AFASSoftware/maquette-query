import {expect, sinon} from './test-utilities';
import {h, VNode} from 'maquette';
import {createTestProjector} from '../src/index';

describe('simulator', () => {

  let query = (vnode: VNode) => {
    return createTestProjector(() => vnode);
  };

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
    expect(handleKeyDown).to.be.calledWith(sinon.match({ which: 13, target: element }));
  });

  it('can simulate keyUp', () => {
    let element = {};
    let handleKeyUp = sinon.stub();
    let vnode = h('input', { type: 'text', onkeyup: handleKeyUp });
    query(vnode).simulate.keyUp(13, element);
    expect(handleKeyUp).to.be.calledWith(sinon.match({ which: 13, target: element }));
  });

  it('can simulate mouseDown', () => {
    let element = {};
    let handleMouseDown = sinon.stub();
    let vnode = h('input', { type: 'text', onmousedown: handleMouseDown });
    query(vnode).simulate.mouseDown(element, { pageX: 100, pageY: 200 });
    expect(handleMouseDown).to.be.calledWith(sinon.match({ target: element, pageX: 100, pageY: 200 }));
  });

  it('can simulate mouseUp', () => {
    let element = {};
    let handleMouseUp = sinon.stub();
    let vnode = h('input', { type: 'text', onmouseup: handleMouseUp });
    query(vnode).simulate.mouseUp(element);
    expect(handleMouseUp).to.be.calledWith(sinon.match({ target: element }));
  });

  it('can simulate click', () => {
    let element = {};
    let handleClick = sinon.stub();
    let vnode = h('input', { type: 'text', onclick: handleClick });
    query(vnode).simulate.click(element);
    expect(handleClick).to.be.calledWith(sinon.match({ target: element }));
  });

  it('can simulate keypress firing keyDown and keyUp', () => {
    let element = {};
    let handleKeyDown = sinon.spy((evt: KeyboardEvent) => {
      expect(evt.which).to.equal(97);
      expect(evt.target).to.deep.include({ value: '' });
    });
    let handleKeyUp = sinon.spy((evt: KeyboardEvent) => {
      expect(evt.which).to.equal(97);
      expect(evt.target).to.deep.include({ value: 'a' });
    });
    let vnode = h('input', { type: 'text', onkeydown: handleKeyDown, onkeyup: handleKeyUp });
    query(vnode).simulate.keyPress('a', '', 'a', element);
    expect(handleKeyDown).to.be.calledOnce;
    expect(handleKeyUp).to.be.calledOnce;
  });

  it('can simulate keypress firing input', () => {
    let handleInput = sinon.stub();
    let vnode = h('input', { type: 'text', oninput: handleInput });
    query(vnode).simulate.keyPress(97, '', 'a');
    expect(handleInput).to.be.calledWith(sinon.match({ target: { value: 'a' } }));
  });

  it('creates events which can be instructed to preventDefault', () => {
    let handleClick = (evt: MouseEvent) => {
      evt.preventDefault();
      evt.stopPropagation();
    };
    let vnode = h('input', { type: 'text', onclick: handleClick });
    let event = query(vnode).simulate.click({});
    expect(event.defaultPrevented).to.equal(true);
    expect((event as any).propagationStopped).to.equal(true);
  });

});
