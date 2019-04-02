'use strict'

const assert = require('assert')
const tap = require('tap')
const inversio = require('../')

const noop = () => {}

const {Suite, supressInversioError} = require('./util')

new Suite('container.resolve')
  .test('can resolve a single component', () => inversio()
    .component({name: 'a', factory: () => 'value of a'})
    .resolve('a')
    .then(assert.equal.bind(null, 'value of a')))
  .test('fails for missing component', () => inversio()
    .resolve('missing')
    .catch(supressInversioError('UnresolvableDependency')))
  .run()
