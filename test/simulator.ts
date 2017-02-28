import {expect, sinon} from './test-utilities';
import {h, VNode} from 'maquette';
import {createTestProjector} from '../src/test-projector';

describe('simulator', () => {

  let createQuery = (vnode: VNode) => {
    return createTestProjector(() => vnode).root;
  };

  it('can simulate input', () => {
    let handleInput = sinon.stub();
    let vnode = h('input', { type: 'text', oninput: handleInput });
    createQuery(vnode).simulate.input({ value: 'Text1' });
    expect(handleInput).to.be.calledWith(sinon.match({ target: { value: 'Text1' } }));
  });

  it('can simulate blur', () => {
    let element = {};
    let handleBlur = sinon.stub();
    let vnode = h('input', { type: 'text', onblur: handleBlur });
    createQuery(vnode).simulate.blur(element);
    expect(handleBlur).to.be.calledWith(sinon.match({ target: element }));
  });

  it('can simulate focus', () => {
    let element = {};
    let handleFocus = sinon.stub();
    let vnode = h('input', { type: 'text', onfocus: handleFocus });
    createQuery(vnode).simulate.focus(element);
    expect(handleFocus).to.be.calledWith(sinon.match({ target: element }));
  });

  it('can simulate change', () => {
    let element = {};
    let handleChange = sinon.stub();
    let vnode = h('input', { type: 'text', onchange: handleChange });
    createQuery(vnode).simulate.change(element);
    expect(handleChange).to.be.calledWith(sinon.match({ target: element }));
  });

  it('can simulate keyDown', () => {
    let element = {};
    let handleKeyDown = sinon.stub();
    let vnode = h('input', { type: 'text', onkeydown: handleKeyDown });
    createQuery(vnode).simulate.keyDown(13, element);
    expect(handleKeyDown).to.be.calledWith(sinon.match({ which: 13, target: element }));
  });

  it('can simulate keyUp', () => {
    let element = {};
    let handleKeyUp = sinon.stub();
    let vnode = h('input', { type: 'text', onkeyup: handleKeyUp });
    createQuery(vnode).simulate.keyUp(13, element);
    expect(handleKeyUp).to.be.calledWith(sinon.match({ which: 13, target: element }));
  });

  it('can simulate mouseDown', () => {
    let element = {};
    let handleMouseDown = sinon.stub();
    let vnode = h('input', { type: 'text', onmousedown: handleMouseDown });
    createQuery(vnode).simulate.mouseDown(element, { pageX: 100, pageY: 200 });
    expect(handleMouseDown).to.be.calledWith(sinon.match({ target: element, pageX: 100, pageY: 200 }));
  });

  it('can simulate mouseUp', () => {
    let element = {};
    let handleMouseUp = sinon.stub();
    let vnode = h('input', { type: 'text', onmouseup: handleMouseUp });
    createQuery(vnode).simulate.mouseUp(element);
    expect(handleMouseUp).to.be.calledWith(sinon.match({ target: element }));
  });

  it('can simulate mouseOver', () => {
    let element = {};
    let handleMouseOver = sinon.stub();
    let vnode = h('input', { type: 'text', onmouseover: handleMouseOver });
    createQuery(vnode).simulate.mouseOver(element);
    expect(handleMouseOver).to.be.calledWith(sinon.match({ target: element }));
  });

  it('can simulate mouseOut', () => {
    let element = {};
    let handleMouseOut = sinon.stub();
    let vnode = h('input', { type: 'text', onmouseout: handleMouseOut });
    createQuery(vnode).simulate.mouseOut(element);
    expect(handleMouseOut).to.be.calledWith(sinon.match({ target: element }));
  });

  it('can simulate click', () => {
    let element = {};
    let handleClick = sinon.stub();
    let vnode = h('input', { type: 'text', onclick: handleClick });
    createQuery(vnode).simulate.click(element);
    expect(handleClick).to.be.calledWith(sinon.match({ target: element }));
  });

  it('can simulate right mouse button click', () => {
    let element = {};
    let handleClick = sinon.stub();
    let vnode = h('input', { type: 'text', onclick: handleClick });
    createQuery(vnode).simulate.click(element, {which: 2});
    let evt: MouseEvent = handleClick.lastCall.args[0];
    expect(evt.which).to.equal(2);
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
    createQuery(vnode).simulate.keyPress('a', '', 'a', element);
    expect(handleKeyDown).to.be.calledOnce;
    expect(handleKeyUp).to.be.calledOnce;
  });

  it('can simulate keypress firing input', () => {
    let handleInput = sinon.stub();
    let vnode = h('input', { type: 'text', oninput: handleInput });
    createQuery(vnode).simulate.keyPress(97, '', 'a');
    expect(handleInput).to.be.calledWith(sinon.match({ target: { value: 'a' } }));
  });

  it('will not set the value and will not fire the input event when the keyDown event has its default prevented', () => {
    let element = { value: 'initial' };
    let handleKeyDown = sinon.spy((event: KeyboardEvent) => {
      event.preventDefault();
    });
    let handleInput = sinon.stub();
    let handleKeyUp = sinon.stub();

    let vnode = h('input', { type: 'text', onkeydown: handleKeyDown, onkeyup: handleKeyUp, oninput: handleInput });
    createQuery(vnode).simulate.keyPress('a', 'initial', 'should not be this', element);
    expect(handleKeyDown).to.have.been.calledOnce;
    expect(handleInput).to.not.have.been.calledOnce;
    expect(handleKeyUp).to.have.been.calledOnce;
    expect(element.value).to.equal('initial');
  });

  it('creates events which can be instructed to preventDefault', () => {
    let handleClick = (evt: MouseEvent) => {
      evt.preventDefault();
      evt.stopPropagation();
    };
    let vnode = h('input', { type: 'text', onclick: handleClick });
    let event = createQuery(vnode).simulate.click({});
    expect(event.defaultPrevented).to.equal(true);
    expect((event as any).propagationStopped).to.equal(true);
  });

  it('can simulate mousewheel', () => {
    let element = {};
    let handleMouseWheel = sinon.stub();
    let vnode = h('div', { onmousewheel: handleMouseWheel });
    createQuery(vnode).simulate.mouseWheel({}, element);
    expect(handleMouseWheel).to.be.calledWith(sinon.match({ target: element }));
  });
});
