import { expect } from './test-utilities';
import { Component, h } from 'maquette';
import { createTestProjector } from '../src/test-projector';

// The hello world application
let createHelloWorldApp = () => {
  let name = ''; // Piece of data

  let handleNameInput = (evt: Event) => {
    name = (evt.target as HTMLInputElement).value;
  };

  return {
    renderMaquette: () => {
      return h('div', [
        h('input', {
          type: 'text', placeholder: 'What is your name?',
          value: name, oninput: handleNameInput
        }),
        h('p.output', ['Hello ' + (name || 'you') + '!'])
      ]);
    }
  };
};

describe('hello world app', () => {

  let helloWorldApp: Component;
  let projector = createTestProjector();
  let inputElement: HTMLInputElement; // not really useful in this particular application, but added just for demonstration purposes.

  let input = projector.query('input');
  let output = projector.query('.output');

  beforeEach(() => {
    helloWorldApp = createHelloWorldApp();
    projector.initialize(helloWorldApp.renderMaquette);
    inputElement = { value: '' } as any;
    input.setTargetDomNode(inputElement);
  });

  it('outputs "hello you!" when no name has been entered', () => {
    expect(output.textContent).to.equal('Hello you!');
  });

  it('outputs the value currently being typed', () => {
    input.simulate.keyPress('J', '', 'J');
    expect(output.textContent).to.equal('Hello J!');
    input.simulate.keyPress('O', 'J', 'Jo');
    expect(output.textContent).to.equal('Hello Jo!');
    expect(inputElement.value).to.equal('Jo');
  });

  it('greets the user by the name he has entered in one input event (using drag and drop for example)', () => {
    input.simulate.input({ value: 'Johan' });
    expect(output.textContent).to.equal('Hello Johan!');
  });
});
