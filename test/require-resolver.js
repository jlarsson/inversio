/* global describe, it */

'use strict'

var assert = require('assert')
var _ = require('lodash')
var garcon = require('../')

describe('require resolver', function () {
  it('can resolve using builtin require(): inject("require:lodash")', function (done) {
    garcon()
      .inject('require:lodash', function (ld) { return ld })
      .then(function (ld) {
        assert(_ === ld)
      })
      .then(done, done)
  })
})
