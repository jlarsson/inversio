/* global describe, it */

'use strict'

var assert = require('assert')
var inversio = require('../')

describe('optional binder', () => {
  it('resolves to undefined for unregistered services',
    () => inversio()
      .component({
        name: 'A',
        factory: () => 'A'
      })
      .inject('A', '?A', '?missing', 'A')
      .then(assert.deepEqual.bind(null, ['A', 'A', undefined, 'A'])))
})
