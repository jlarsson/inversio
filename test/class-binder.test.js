const inversio = require('../')
const {Suite} = require('./util')

class TestSuper {
  foo () { this.superIsCalled = true }
}

new Suite('class binder')
  .test('can construct a class based on super class and mixins',
    t => inversio()
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
        t.ok(instance.superIsCalled, 'Expected super class')
        t.ok(instance.superIsCalled, 'Expected super class')
        t.ok(instance.subIsCalled, 'Expected extended class')
        t.ok(instance.sub2IsCalled, 'Expected second extended class')
      }))
  .run()
