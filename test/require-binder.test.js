const assert = require('assert')
const fs = require('fs')
const inversio = require('../')
const {Suite} = require('./util')

new Suite('require binder')
  .test('can resolve using builtin require(): inject("require:fs")',
    () => inversio()
      .inject('require:fs', v => v)
      .then(rfs => assert(rfs === fs)))
  .run()
