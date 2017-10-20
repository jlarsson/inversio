/* global describe, it */

'use strict'

var assert = require('assert')
var inversio = require('../')

describe('tag binder', () => {
  it('can resolve a list of services matching tag: inject("tag:cool stuff")',
    () => inversio()
      .component(
        makeService('a', 'A', ['boring', 'cool stuff']),
        makeService('b', 'B', ['cool stuff']),
        makeService('c', 'C', ['what?'])
      )
      .inject('tag:cool stuff', that => that)
      .then(assert.deepEqual.bind(null, ['A', 'B'])))

  it('allows anonymous components',
    () => inversio()
      .component({tags: ['a'], factory: () => 'a'})
      .component({tags: ['a'], factory: () => 'a2'}))

  it('respects order',
    () => inversio()
      .component(
        makeService('a', 'A', ['t']),
        makeService('b', 'B', ['t'], -100),
        makeService('c', 'C', ['t'], 100),
        makeService('d', 'D', ['t'], -200)
      )
      .inject('tag:t', that => that)
      .then(assert.deepEqual.bind(null, ['D', 'B', 'A', 'C'])))

  it('throws on self-circular dependencies',
    // a is tagged as being a and also depends on all tagged as being a...
    () => inversio()
      .component(
        {name: 'a', tags: ['a'], depends: ['tag:a'], factory: listOfAs => 'A'}
      )
      .resolve('a')
      .then(() => assert.fail('Expected exception'))
      .catch(e => assert.equal(e.code, 'CircularDependency')))

  it('throws on circular dependencies',
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

  function makeService (name, value, tags, order) {
    return {
      name: name,
      tags: tags,
      order: order,
      factory: function () {
        return value
      }
    }
  }
})
