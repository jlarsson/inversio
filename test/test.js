/* global describe, it */

'use strict'

const assert = require('assert')
const inversio = require('../')

const noop = () => {}

describe('container.inject', () => {
  it('builds object graphs correctly',
    () => inversio()
      .component({name: 'a', depends: ['b', 'c'], factory: (b, c) => ({n: 'a', b: b, c: c})})
      .component({name: 'b', depends: ['c'], factory: c => ({n: 'b', c: c})})
      .component({name: 'c', factory: () => ({n: 'c'})})
      .inject('a', a => a)
      .then(a => assert.deepEqual({
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
      }, a)))

  it('throws on circular dependencies',
    () => inversio()
      .component({name: 'a', depends: ['b'], factory: noop})
      .component({name: 'b', depends: ['c'], factory: noop})
      .component({name: 'c', depends: ['a'], factory: noop})
      .inject('a', a => assert.fail('should never reach this'))
      .catch(supressInversioError.bind(null, 'CircularDependency')))

  it('caches components, i.e effectively hands out singletons',
    () => inversio()
      .component({name: 'a', factory: () => ({name: 'a'})})
      .component({name: 'b', depends: ['a'], factory: a => ({name: 'b', a: a})})
      .inject('a', 'b', 'a', (a0, b, a1) => {
        assert.deepEqual(a0, {name: 'a'})
        assert.deepEqual(b, {name: 'b', a: a0})
        assert(a0 === a1)
        assert(a0 === b.a)
      }))
})

describe('container.resolve', () => {
  it('can resolve a single component',
    () => inversio()
      .component({name: 'a', factory: () => 'value of a'})
      .resolve('a')
      .then(assert.equal.bind(null, 'value of a')))

  it('fails for missing component',
    () => inversio()
      .resolve('missing')
      .catch(supressInversioError.bind(null, 'UnresolvableDependency')))
})

describe('container.inject', () => {
  let s1 = {x: 'this is a service instance'}
  let s2 = {y: 'this is another service instance'}
  let s3 = {z: 'this is yet another service instance'}

  function createContainer (argument) {
    return inversio()
      .component(
        createServiceComponent('s1', s1),
        createServiceComponent('s2', s2),
        createServiceComponent('s3', s3))
  }

  function createServiceComponent (name, service) {
    return {name: name, factory: () => service}
  }

  it('inject([a, b, c], f) -> f(component(a), component(b), component(c))',
    () => createContainer()
      .inject(['s1', 's2', 's3'], (a1, a2, a3) => assert.deepEqual([s1, s2, s3], [a1, a2, a3])))

  it('inject(a, b, c, f) -> f(component(a), component(b), component(c))',
    () => createContainer()
      .inject('s1', 's2', 's3', (a1, a2, a3) => assert.deepEqual([s1, s2, s3], [a1, a2, a3])))

  it('inject(a, b, c) -> [component(a), component(b), component(c)] if no callback',
    () => createContainer()
      .inject('s1', 's2', 's3')
      .then(l => assert.deepEqual([s1, s2, s3], l)))
})

describe('container.component({name,depends,tags,factory}) parameter validation', () => {
  it('fails if name is not unique',
    () => assertInversioThrows('ComponentNameDuplicate',
      () => inversio()
        .component({name: 'a', factory: noop})
        .component({name: 'a', factory: noop})))

  it('fails if name is empty',
    () => assertInversioThrows('ComponentNameIsEmpty',
      () => inversio()
        .component({})))

  it('fails if name is empty and list of tags is empty',
    () => assertInversioThrows('ComponentNameIsEmpty',
      () => inversio()
        .component({tags: []})))

  it('fails if name is not a string', () => {
    assertInversioThrows('ComponentNameIsNotString',
      () => inversio()
        .component({name: 1}))
    assertInversioThrows('ComponentNameIsNotString',
      () => inversio()
        .component({name: {}}))
  })

  it('fails if factory is not defined',
    () => assertInversioThrows('ComponentHasNoFactory',
      () => inversio()
        .component({name: 's'})))

  it('fails if factory is not a function',
    () => assertInversioThrows('ComponentFactoryIsNotFunction',
      () => inversio()
        .component({name: 's', factory: {}})))

  it('fails if depends is not array',
    () => assertInversioThrows('ComponentDependsNotArray',
      () => inversio()
        .component({name: 's', factory: noop, depends: {}})))

  it('fails if tags is not array',
    () => assertInversioThrows('ComponentTagsNotArray',
      () => inversio()
        .component({name: 's', factory: noop, tags: {}})))

  it('fails if tags is not array of strings',
    () => assertInversioThrows('ComponentTagsNotStringArray',
      () => inversio()
        .component({name: 's', factory: noop, tags: [123, {}]})))

  it('allows empty name if tags are specified',
    () => inversio()
      .component({tags: ['t1'], factory: () => 'a1'})
      .resolve('tag:t1')
      .then(l => assert.deepEqual(['a1'], l)))
})

function supressInversioError (code, err) {
  if (!(err && (err.code === code))) {
    throw err
  }
}

function assertInversioThrows (code, f) {
  try {
    f()
    assert.fail(`Expected exception ${code}`)
  } catch (e) {
    supressInversioError(code, e)
  }
}
