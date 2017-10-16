/* global describe, it */

'use strict'

var assert = require('assert')
var _ = require('lodash')
var inversio = require('../')

describe('require binder', () => {
  it('can resolve using builtin require(): inject("require:lodash")',
    () => inversio()
      .inject('require:lodash', ld => ld)
      .then(ld => assert(_ === ld)))
})
