/* global describe, it */
'use strict'

var assert = require('assert')
var inversio = require('../')
var co = require('co')

describe('yield container.resolve()', () => {
  it('handles missing tagged components',
    () => co(function * () {
      let container = inversio()
      assert.deepEqual([], yield container.resolve('tag:missing'))
    }))

  it('handles tagged components',
    () => co(function * () {
      let container = inversio()
        .component({
          name: 'a',
          tags: ['t'],
          factory: () => 'instance of a'
        })
        .component({
          name: 'b',
          tags: ['t'],
          factory: () => 'instance of b'
        })
      assert.deepEqual(['instance of a', 'instance of b'], yield container.resolve('tag:t'))
    }))

  it('handles missing optional components',
    () => co(function * () {
      let container = inversio()
      assert.equal(undefined, yield container.resolve('?missing'))
    }))

  it('handles resolve the expected way',
    () => co(function * () {
      let container = inversio()
        .component({
          name: 'a',
          factory: () => 'instance of a'
        })
      assert.equal('instance of a', yield container.resolve('a'))
    }))

  it('fails in expected way',
    () => co(function * () {
      let container = inversio()
      yield container.resolve('missing')
    })
    .then(() => assert.fail('Expected container.resolve() to throw exception'))
    .catch(e => assert.equal(e.code, 'UnresolvableDependency')))
})
