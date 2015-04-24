/* global describe, it */

'use strict'

var assert = require('assert')
var inversio = require('../')

describe('optional binder', function () {
  it('resolves to undefined for unregistered services', function () {
    return inversio()
      .component({
        name: 'A',
        factory: function () {
          return 'A'
        }
      })
      .inject('A', '?A', '?missing', 'A')
      .then(assert.deepEqual.bind(null, ['A', 'A', undefined, 'A']))
  })
})
