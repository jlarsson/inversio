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

  it('respects order',
    () => inversio()
      .component(
        makeService('a', 'A', ['t']),
        makeService('b', 'B', ['t'], -100),
        makeService('c', 'C', ['t'], 100)
      )
      .inject('tag:t', that => that)
      .then(assert.deepEqual.bind(null, ['B', 'A', 'C'])))

  function makeService (name, value, tags, order) {
    return {
      name: name,
      tags: tags || [],
      order: order,
      factory: function () {
        return value
      }
    }
  }
})
