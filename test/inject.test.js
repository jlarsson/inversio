'use strict'

const assert = require('assert')
const tap = require('tap')
const inversio = require('../')

const noop = () => {}

const {Suite, supressInversioError} = require('./util')

const s1 = {x: 'this is a service instance'}
const s2 = {y: 'this is another service instance'}
const s3 = {z: 'this is yet another service instance'}

const createContainer = () => inversio()
  .component(
      createServiceComponent('s1', s1),
      createServiceComponent('s2', s2),
      createServiceComponent('s3', s3))


const createServiceComponent = (name, service) => ({name: name, factory: () => service})
const thrw = err => { throw err }

new Suite('container.inject')
  .test('builds object graphs correctly',
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
  .test('throws on circular dependencies',
    t => inversio()
      .component({name: 'a', depends: ['b'], factory: noop})
      .component({name: 'b', depends: ['c'], factory: noop})
      .component({name: 'c', depends: ['a'], factory: noop})
      .inject('a', a => assert.fail('should never reach this'))
      .catch(supressInversioError('CircularDependency')))
  .test('caches components, i.e effectively hands out singletons',
    t => inversio()
      .component({name: 'a', factory: () => ({name: 'a'})})
      .component({name: 'b', depends: ['a'], factory: a => ({name: 'b', a: a})})
      .inject('a', 'b', 'a', (a0, b, a1) => {
        assert.deepEqual(a0, {name: 'a'})
        assert.deepEqual(b, {name: 'b', a: a0})
        assert(a0 === a1)
        assert(a0 === b.a)
      }))

  .test('inject([a, b, c], f) -> f(component(a), component(b), component(c))',
    () => createContainer()
      .inject(['s1', 's2', 's3'], (a1, a2, a3) => assert.deepEqual([s1, s2, s3], [a1, a2, a3])))

  .test('inject(a, b, c, f) -> f(component(a), component(b), component(c))',
    () => createContainer()
      .inject('s1', 's2', 's3', (a1, a2, a3) => assert.deepEqual([s1, s2, s3], [a1, a2, a3])))

  .test('inject(a, b, c) -> [component(a), component(b), component(c)] if no callback',
    () => createContainer()
      .inject('s1', 's2', 's3')
      .then(l => assert.deepEqual([s1, s2, s3], l)))

  .test('inject([a, b, c]) -> [component(a), component(b), component(c)] if no callback',
    () => createContainer()
      .inject(['s1', 's2', 's3'])
      .then(l => assert.deepEqual([s1, s2, s3], l)))
  .run()
