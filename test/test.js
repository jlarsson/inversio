/* global describe, it */
'use strict'

var assert = require('assert')
var _ = require('lodash')
var garcon = require('../')

describe('container.service({name,depends,tags,factory}) parameter validation', function () {
  it('fails if name is empty', function () {
    assertException('ServiceNameIsEmpty', function () {
      garcon().service()
    })
    assertException('ServiceNameIsEmpty', function () {
      garcon().service({})
    })
  })
  it('fails if name is not a string', function () {
    assertException('ServiceNameIsNotString', function () {
      garcon().service({name: 1})
    })
    assertException('ServiceNameIsNotString', function () {
      garcon().service({name: {}})
    })
  })
  it('fails if factory is not defined', function () {
    assertException('ServiceHasNoFactory', function () {
      garcon().service({name: 's'})
    })
  })
  it('fails if factory is not a function', function () {
    assertException('ServiceFactoryIsNotFunction', function () {
      garcon().service({name: 's', factory: {}})
    })
  })
  it ('fails if depends is not array', function () {
    assertException('ServiceDependsNotArray', function () {
      garcon().service({name: 's', factory: _.noop, depends: {}})
    })
  })
  it ('fails if tags is not array', function () {
    assertException('ServiceTagsNotArray', function () {
      garcon().service({name: 's', factory: _.noop, tags: {}})
    })
  })
})

describe('scratchpad', function () {
  it('happypath', function (done) {
    function delay(t) {
      return new Promise(function (resolve) {
        setTimeout(resolve, 0)
      })
    }
    garcon().service({
      name: 'A',
      depends: ['S1', 'S2', 'tag:s'],
      tags: [],
      factory: function (s1, s2, tail) {
        return delay(1000).then(function () {
          return {c: 'A', s1: s1, s2: s2, tail: tail}
        })
      }
    })
    .service({
      name: 'S1',
      depends: [],
      tags: ['s','x'],
      factory: function () {
        return delay(1000).then(function () {
          return {c: 'S1'}
        })
      }
    })
    .service({
      name: 'S2',
      depends: ['S1'],
      tags: ['s'],
      factory: function (s1) {
        return delay(1000).then(function () {
          return {c: 'S2', s1: s1}
        })
      }
    })
    .service({
      name: 'extra',
      depends: [],
      tags: ['s','x'],
      factory: function () {
        return delay(1000).then(function () {
          return {c: 'extra'}
        })
      }
    })
    .inject(['A'], function (a) {
      return a
    })
    .then(function (a) {
      console.log(JSON.stringify(a, null, 2))
      done()
    })
    .catch(function (e) {
      console.error(e)
      console.error(e.stack)
      done()

    })

  })
})

function assertException(code, f) {
  try {
    f()
    assert.fail('Expected exception %s', code)
  } catch (e) {
    assert.equal(code, e.garcon_reason, 'Expected Error.garcon_reason to be ' + code)
  }
}
