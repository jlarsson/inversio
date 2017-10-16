/* global describe, it */

'use strict'

var assert = require('assert')
var fs = require('fs')
var inversio = require('../')

describe('require binder', () => {
  it('can resolve using builtin require(): inject("require:fs")',
    () => inversio()
      .inject('require:fs', v => v)
      .then(rfs => assert(rfs === fs)))
})
