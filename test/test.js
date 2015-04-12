/* global describe, it */

'use strict'

var assert = require('assert')
var _ = require('lodash')
var inversio = require('../')

describe('container.inject', function () {
  it('build object graphs correctly', function (done) {
    inversio()
      .component({name: 'a', depends: ['b', 'c'], factory: function (b, c) {
        return {n: 'a', b: b, c: c}
      }})
      .component({name: 'b', depends: ['c'], factory: function (c) {
        return {n: 'b', c: c}
      }})
      .component({name: 'c', factory: function () {
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
    inversio()
      .component({name: 'a', depends: ['b'], factory: _.noop})
      .component({name: 'b', depends: ['c'], factory: _.noop})
      .component({name: 'c', depends: ['a'], factory: _.noop})
      .inject('a', function (a) {
        assert.fail('should never reach this')
      })
      .catch(supressInversioError.bind(null, 'CircularDependency'))
      .then(done, done)
  })

  it('throws on unknown namespaces: inject("unkown:unseen")', function (done) {
    inversio()
      .inject('?:foo')
      .catch(supressInversioError.bind(null, 'UnknownNamespace'))
      .then(done, done)
  })
})

describe('container.inject', function () {
  var s1 = {x: 'this is a service instance'}
  var s2 = {y: 'this is another service instance'}
  var s3 = {z: 'this is yet another service instance'}

  function createContainer (argument) {
    return inversio()
      .component(
        createServiceComponent('s1', s1),
        createServiceComponent('s2', s2),
        createServiceComponent('s3', s3))
  }
  it('inject([a, b, c], f) -> f(component(a), component(b), component(c))', function (done) {
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

  it('inject(a, b, c, f) -> f(component(a), component(b), component(c))', function (done) {
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

  it('inject(a, b, c) -> [component(a), component(b), component(c)] if no callback', function (done) {
    createContainer()
    .inject('s1', 's2', 's3')
    .then(function (l) {
      assert.deepEqual([s1, s2, s3], l)
      done()
    })
    .catch(done)
  })

  function createServiceComponent (name, service) {
    return {name: name, factory: function () {
      return service
    }}
  }
})

describe('container.component({name,depends,tags,factory}) parameter validation', function () {
  it('fails if name is not unique', function () {
    assertInversioThrows('ComponentNameDuplicate', function () {
      inversio()
      .component({name: 'a', factory: _.noop})
      .component({name: 'a', factory: _.noop})
    })
  })
  it('fails if name is empty', function () {
    assertInversioThrows('ComponentNameIsEmpty', function () {
      inversio().component({})
    })
  })
  it('fails if name is not a string', function () {
    assertInversioThrows('ComponentNameIsNotString', function () {
      inversio().component({name: 1})
    })
    assertInversioThrows('ComponentNameIsNotString', function () {
      inversio().component({name: {}})
    })
  })
  it('fails if factory is not defined', function () {
    assertInversioThrows('ComponentHasNoFactory', function () {
      inversio().component({name: 's'})
    })
  })
  it('fails if factory is not a function', function () {
    assertInversioThrows('ComponentFactoryIsNotFunction', function () {
      inversio().component({name: 's', factory: {}})
    })
  })
  it('fails if depends is not array', function () {
    assertInversioThrows('ComponentDependsNotArray', function () {
      inversio().component({name: 's', factory: _.noop, depends: {}})
    })
  })
  it('fails if tags is not array', function () {
    assertInversioThrows('ComponentTagsNotArray', function () {
      inversio().component({name: 's', factory: _.noop, tags: {}})
    })
  })
})

function supressInversioError (code, err) {
  if (!(err && (err.code === code))) {
    throw err
  }
}

function assertInversioThrows (code, f) {
  try {
    f()
    assert.fail('Expected exception %s', code)
  } catch (e) {
    supressInversioError(code, e)
  }
}
