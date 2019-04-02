const assert = require('assert')
const inversio = require('../')
const {Suite} = require('./util')

new Suite('optional binder')
  .test('resolves to undefined for unregistered services',
    () => inversio()
      .component({
        name: 'A',
        factory: () => 'A'
      })
      .inject('A', '?A', '?missing', 'A')
      .then(assert.deepEqual.bind(null, ['A', 'A', undefined, 'A'])))
  .run()
