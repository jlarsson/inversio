/* global describe, it */

'use strict'

var assert = require('assert')
var garcon = require('../')

describe('tag resolver', function () {
  it('can resolve a list of services matching tag: inject("tag:cool stuff")', function (done) {
    garcon()
      .service(
        makeService('a', 'A', ['boring', 'cool stuff']),
        makeService('b', 'B', ['cool stuff']),
        makeService('c', 'C', ['what?'])
      )
      .inject('tag:cool stuff', function (that) { return that })
      .then(function (l) {
        assert.deepEqual(['A', 'B'], l)
      })
      .then(done, done)

    function makeService (name, value, tags) {
      return {
        name: name,
        tags: tags || [],
        factory: function () {
          return value
        }
      }
    }
  })
})
