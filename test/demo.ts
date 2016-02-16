import {expect} from './test-utilities';
import {h} from 'maquette';
import {query} from '../src/index';

describe('demo', () => {

  let name = ''; // Piece of data

  // Plain event handler
  let handleNameInput = (evt: Event) => {
    name = (evt.target as HTMLInputElement).value;
  };

  // This function uses the 'hyperscript' notation to create the virtual DOM.
  let renderMaquette = () => {
    return h('div', [
      h('input', {
        type: 'text', placeholder: 'What is your name?',
        value: name, oninput: handleNameInput
      }),
      h('p.output', ['Hello ' + (name || 'you') + '!'])
    ]);
  };

  beforeEach(() => {
    name = '';
  });

  it('displays "hello you!" when no name has been entered', () => {
    let output = query(renderMaquette()).find('.output');
    expect(output.text()).to.equal('Hello you!');
  });

  it('greets the user by the name he has entered', () => {
    let input = query(renderMaquette()).find('input');
    input.simulate.input({ value: 'Johan' });
    let output = query(renderMaquette()).find('.output');
    expect(output.text()).to.equal('Hello Johan!');
  });
});
