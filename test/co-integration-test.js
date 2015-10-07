/* global describe, it */
'use strict'

var assert = require('assert')
var inversio = require('../')
var co = require('co')

describe('yield container.resolve()', function () {
  it('handles missing tagged components', function () {
    return co(function * () {
      let container = inversio()
      assert.deepEqual([], yield container.resolve('tag:missing'))
    })
  })

  it('handles tagged components', function () {
    return co(function * () {
      let container = inversio()
        .component({
          name: 'a',
          tags: ['t'],
          factory: function () {
            return 'instance of a'
          }
        })
        .component({
          name: 'b',
          tags: ['t'],
          factory: function () {
            return 'instance of b'
          }
        })
      assert.deepEqual(['instance of a', 'instance of b'], yield container.resolve('tag:t'))
    })
  })
  it('handles missing optional components', function () {
    return co(function * () {
      let container = inversio()
      assert.equal(undefined, yield container.resolve('?missing'))
    })
  })
  it('handles resolve the expected way', function () {
    return co(function * () {
      let container = inversio()
        .component({
          name: 'a',
          factory: function () {
            return 'instance of a'
          }
        })
      assert.equal('instance of a', yield container.resolve('a'))
    })
  })
  it('fails in expected way', function () {
    return co(function * () {
      let container = inversio()
      yield container.resolve('missing')
    })
    .then(function () {
      assert.fail('Expected container.resolve() to throw exception')
    })
    .catch(function (e) {
      assert.equal(e.code, 'UnresolvableDependency')
    })
  })
})
