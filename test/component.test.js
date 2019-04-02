'use strict'

const tap = require('tap')
const inversio = require('../')

const noop = () => {}

const {Suite} = require('./util')

const assertInversioThrows = (code, f) => t => Promise.resolve()
    .then(() => f(t))
    .then(() => t.fail(`Expected exception ${code}`))
    .catch(err => {
      if (err.code !== code) throw err
    })

new Suite('container.component({name,depends,tags,factory}) parameter validation')
  .test('fails if name is not unique',
    assertInversioThrows('ComponentNameDuplicate',
      () => inversio()
        .component({name: 'a', factory: noop})
        .component({name: 'a', factory: noop})))

  .test('fails if name is empty (and no tags or timid...)',
    assertInversioThrows('ComponentNameIsEmpty',
      () => inversio().component({})))

  .test('fails if name is empty and list of tags is empty',
    assertInversioThrows('ComponentNameIsEmpty',
      () => inversio().component({tags: []})))

  .test('fails if name is number (not a string)',
    assertInversioThrows('ComponentNameIsNotString',
      () => inversio().component({name: 1})))

  .test('fails if name is object (not a string)',
    assertInversioThrows('ComponentNameIsNotString',
      () => inversio().component({name: {}})))

  .test('fails if factory is not defined',
    assertInversioThrows('ComponentHasNoFactory',
      () => inversio()
        .component({name: 's'})))

  .test('fails if factory is not a function',
    assertInversioThrows('ComponentFactoryIsNotFunction',
      () => inversio()
        .component({name: 's', factory: {}})))

  .test('fails if depends is not array',
    assertInversioThrows('ComponentDependsNotArray',
      () => inversio()
        .component({name: 's', factory: noop, depends: {}})))

  .test('fails if tags is not array',
    assertInversioThrows('ComponentTagsNotArray',
      () => inversio()
        .component({name: 's', factory: noop, tags: {}})))

  .test('fails if tags is not array of strings',
    assertInversioThrows('ComponentTagsNotStringArray',
      () => inversio()
        .component({name: 's', factory: noop, tags: [123, {}]})))

  .test('allows empty name if tags are specified',
    t => inversio()
      .component({tags: ['t1'], factory: () => 'a1'})
      .resolve('tag:t1')
      .then(l => t.deepEqual(['a1'], l)))
  .run()

new Suite('container.component({timid})')
  .test('timid unresolved components can be overriden',
    t => inversio()
      .component({name: 'a', timid: true, factory: () => 'timid A'})
      .component({name: 'a', factory: () => 'bold A'})
      .resolve('a')
      .then(v => t.equal(v, 'bold A')))

  .test('timid wins over previsous timid',
    t => inversio()
      .component({name: 'a', timid: true, factory: () => 'timid A'})
      .component({name: 'a', timid: true, factory: () => 'second timid'})
      .resolve('a')
      .then(v => t.equal(v, 'second timid')))

  .test('timids all lose in the end',
    t => inversio()
      .component({name: 'a', timid: true, factory: () => 'timid A'})
      .component({name: 'a', timid: true, factory: () => 'second timid'})
      .component({name: 'a', factory: () => 'bold A'})
      .resolve('a')
      .then(v => t.equal(v, 'bold A')))

  .test('timid resolved components can\'t be overriden',
    () => assertInversioThrows(
      'ComponentNameDuplicate',
      () => {
        let container = inversio()
        return container
          .component({name: 'a', timid: true, factory: () => 'timid A'})
          .resolve('a') // <-- after resolving the timid is fixed and can't be replaced
          .then(() => container.component({name: 'a', factory: () => 'bold A'}))
      }))
  .run()
