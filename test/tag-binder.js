/* global describe, it */

'use strict'

var assert = require('assert')
var inversio = require('../')

describe('tag binder', function () {
  it('can resolve a list of services matching tag: inject("tag:cool stuff")', function () {
    return inversio()
      .component(
        makeService('a', 'A', ['boring', 'cool stuff']),
        makeService('b', 'B', ['cool stuff']),
        makeService('c', 'C', ['what?'])
      )
      .inject('tag:cool stuff', function (that) { return that })
      .then(assert.deepEqual.bind(null, ['A', 'B']))
  })

  it('respects order', function () {
    return inversio()
      .component(
        makeService('a', 'A', ['t']),
        makeService('b', 'B', ['t'], -100),
        makeService('c', 'C', ['t'], 100)
      )
      .inject('tag:t', function (that) { return that })
      .then(assert.deepEqual.bind(null, ['B', 'A', 'C']))
  })

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
