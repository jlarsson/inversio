/* global describe, it */

'use strict'

var assert = require('assert')
var inversio = require('../')

class TestSuper {
  foo () { this.superIsCalled = true }
}

describe('mixin binder', () => {
  it('can construct a class based on super class and mixins',
    () => inversio()
      .component({
        name: 'super:Test',
        factory: () => TestSuper
      })
      .component({
        name: 'extends Test',
        tags: ['extends:Test'],
        factory: () => T => class T2 extends T {
          foo () {
            super.foo()
            this.subIsCalled = true
          }
        }
      })
      .component({
        name: 'also extends Test',
        tags: ['extends:Test'],
        factory: () => T => class T3 extends T {
          foo () {
            super.foo()
            this.sub2IsCalled = true
          }
        }
      })
      .resolve('class:Test')
      .then(T => new T())
      .then(instance => {
        instance.foo()
        assert(instance.superIsCalled, 'Expected super class')
        assert(instance.subIsCalled, 'Expected extended class')
        assert(instance.sub2IsCalled, 'Expected second extended class')
      }))
})
