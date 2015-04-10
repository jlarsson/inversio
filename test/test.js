/* global describe, it */

'use strict'

var assert = require('assert')
var _ = require('lodash')
var garcon = require('../')

describe('container.inject', function () {
  it('build object graphs correctly', function (done) {
    garcon()
      .service({name: 'a', depends: ['b', 'c'], factory: function (b, c) {
        return {n: 'a', b: b, c: c}
      }})
      .service({name: 'b', depends: ['c'], factory: function (c) {
        return {n: 'b', c: c}
      }})
      .service({name: 'c', factory: function () {
        return {n: 'c'}
      }})
      .inject('a', function (a) { return a })
      .then(function (a) {
        assert.deepEqual({
          n: 'a',
          b: {
            n: 'b',
            c: {
              n: 'c'
            }
          },
          c: {
            n: 'c'
          }
        }, a)
      })
      .then(done, done)
  })

  it('throws on circular dependencies', function (done) {
    garcon()
      .service({name: 'a', depends: ['b'], factory: _.noop})
      .service({name: 'b', depends: ['c'], factory: _.noop})
      .service({name: 'c', depends: ['a'], factory: _.noop})
      .inject('a', function (a) {
        assert.fail('should never reach this')
      })
      .catch(supressGarconError.bind(null, 'CircularDependency'))
      .then(done, done)
  })

  it('throws on unknown namespaces: inject("unkown:unseen")', function (done) {
    garcon()
      .inject('?:foo')
      .catch(supressGarconError.bind(null, 'UnknownNamespace'))
      .then(done, done)
  })
})

describe('container.inject', function () {
  var s1 = {x: 'this is a service instance'}
  var s2 = {y: 'this is another service instance'}
  var s3 = {z: 'this is yet another service instance'}

  function createContainer (argument) {
    return garcon()
      .service(
        createRegistration('s1', s1),
        createRegistration('s2', s2),
        createRegistration('s3', s3))
  }
  it('inject([a, b, c], f) -> f(service(a), service(b), service(c))', function (done) {
    createContainer()
    .inject(['s1', 's2', 's3'], function (a1, a2, a3) {
      assert.deepEqual([s1, s2, s3], [a1, a2, a3])
      return 'ok'
    })
    .then(function (v) {
      assert.equal('ok', v)
    })
    .then(done, done)
  })

  it('inject(a, b, c, f) -> f(service(a), service(b), service(c))', function (done) {
    createContainer()
      .inject('s1', 's2', 's3', function (a1, a2, a3) {
        assert.deepEqual([s1, s2, s3], [a1, a2, a3])
        return 'ok'
      })
      .then(function (v) {
        assert.equal('ok', v)
      })
      .then(done, done)
  })

  it('inject(a, b, c) -> [service(a), service(b), service(c)] if no callback', function (done) {
    createContainer()
    .inject('s1', 's2', 's3')
    .then(function (l) {
      assert.deepEqual([s1, s2, s3], l)
      done()
    })
    .catch(done)
  })

  function createRegistration (name, service) {
    return {name: name, factory: function () {
      return service
    }}
  }
})

describe('container.service({name,depends,tags,factory}) parameter validation', function () {
  it('fails if name is not unique', function () {
    assertGarconThrows('ServiceNameDuplicate', function () {
      garcon()
      .service({name: 'a', factory: _.noop})
      .service({name: 'a', factory: _.noop})
    })
  })
  it('fails if name is empty', function () {
    assertGarconThrows('ServiceNameIsEmpty', function () {
      garcon().service({})
    })
  })
  it('fails if name is not a string', function () {
    assertGarconThrows('ServiceNameIsNotString', function () {
      garcon().service({name: 1})
    })
    assertGarconThrows('ServiceNameIsNotString', function () {
      garcon().service({name: {}})
    })
  })
  it('fails if factory is not defined', function () {
    assertGarconThrows('ServiceHasNoFactory', function () {
      garcon().service({name: 's'})
    })
  })
  it('fails if factory is not a function', function () {
    assertGarconThrows('ServiceFactoryIsNotFunction', function () {
      garcon().service({name: 's', factory: {}})
    })
  })
  it('fails if depends is not array', function () {
    assertGarconThrows('ServiceDependsNotArray', function () {
      garcon().service({name: 's', factory: _.noop, depends: {}})
    })
  })
  it('fails if tags is not array', function () {
    assertGarconThrows('ServiceTagsNotArray', function () {
      garcon().service({name: 's', factory: _.noop, tags: {}})
    })
  })
})

function supressGarconError (code, err) {
  if (!(err && (err.garcon_reason === code))) {
    throw err
  }
}

function assertGarconThrows (code, f) {
  try {
    f()
    assert.fail('Expected exception %s', code)
  } catch (e) {
    supressGarconError(code, e)
  }
}
