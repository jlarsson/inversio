const assert = require('assert')
const inversio = require('../')
const {Suite} = require('./util')

const makeService = (name, value, tags, order) => ({
    name: name,
    tags: tags,
    order: order,
    factory: function () {
      return value
    }
  })


new Suite('tag binder')
  .test('can resolve a list of services matching tag: inject("tag:cool stuff")',
    () => inversio()
      .component(
        makeService('a', 'A', ['boring', 'cool stuff']),
        makeService('b', 'B', ['cool stuff']),
        makeService('c', 'C', ['what?'])
      )
      .inject('tag:cool stuff', that => that)
      .then(assert.deepEqual.bind(null, ['A', 'B'])))

  .test('allows anonymous components',
    () => inversio()
      .component({tags: ['a'], factory: () => 'a'})
      .component({tags: ['a'], factory: () => 'a2'}))

  .test('respects order',
    () => inversio()
      .component(
        makeService('a', 'A', ['t']),
        makeService('b', 'B', ['t'], -100),
        makeService('c', 'C', ['t'], 100),
        makeService('d', 'D', ['t'], -200)
      )
      .inject('tag:t', that => that)
      .then(assert.deepEqual.bind(null, ['D', 'B', 'A', 'C'])))

  .test('throws on self-circular dependencies',
    // a is tagged as being a and also depends on all tagged as being a...
    () => inversio()
      .component(
        {name: 'a', tags: ['a'], depends: ['tag:a'], factory: listOfAs => 'A'}
      )
      .resolve('a')
      .then(() => assert.fail('Expected exception'))
      .catch(e => assert.equal(e.code, 'CircularDependency')))

  .test('throws on circular dependencies',
    // A(B, B2(C(A)))
    () => inversio()
      .component(
        {name: 'a', depends: ['tag:b'], factory: listOfBs => 'A'},
        {tags: ['b'], factory: () => 'B'},
        {tags: ['b'], depends: ['tag:c'], factory: listOfCs => 'B2'},
        {tags: ['c'], depends: ['a'], factory: a => 'C'}  // this one makes it circular
      )
      .resolve('a')
      .then(() => assert.fail('Expected exception'))
      .catch(e => assert.equal(e.code, 'CircularDependency')))
  .run()
