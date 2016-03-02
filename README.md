# maquette-query
Query utility for maquette's virtual DOM

First of all, querying a virtual DOM makes no sense in production code.
There is however one area that benefits from querying: unit tests.
Maquette-query makes unit testing both easy and expressive.

Consider the following code to test the 'hello you' demonstration from [maquettejs.org](http://maquettejs.org).

```
let projector = createTestProjector(renderMaquette);
let input = projector.query('input');
let output = projector.query('.output');

input.simulate.input({ value: 'John' });
expect(output.textContent).to.equal('Hello John!');
```

Maquette-query provides a `querySelector`-like API to query the virtual DOM.
It also provides a `simulate` interface to facilitate firing of common events.

If you find anything missing, do not hesitate to issue a pull request.
