'use strict'

const failif = require('./failif')
const Injector = require('./injector')

const list = l => [].slice.call(l)
const flatten = list => list.reduce((result, item) => result.concat(Array.isArray(item) ? flatten(item) : item), [])

class Container {
  constructor () {
    this.components = {}
    this.resolved = {}
    this.binders = [
      require('./default-binder'),
      require('./optional-binder'),
      require('./require-binder'),
      require('./tag-binder'),
      require('./class-binder')
    ]
    this.nextAnonymous = 0
  }

  component (component) {
    list(arguments).forEach(d => {
      let def = Object.assign({}, {depends: [], tags: []}, d)
      if (def.hasOwnProperty('name')) {
        failif.ComponentNameIsEmpty(!def.name, component)
        failif.ComponentNameIsNotString(typeof def.name !== 'string', component)
      }
      if (!def.hasOwnProperty('name')) {
        // unnamed components are valid if tags are specified
        failif.ComponentNameIsEmpty(def.tags.length === 0, component)
        def.name = 'anonymous-' + (++this.nextAnonymous)
      }

      failif.ComponentHasNoFactory(!def.factory, component)
      failif.ComponentFactoryIsNotFunction(!(def.factory instanceof Function), component)
      failif.ComponentDependsNotArray(!Array.isArray(def.depends), component)
      failif.ComponentTagsNotArray(!Array.isArray(def.tags), component)
      failif.ComponentTagsNotStringArray(!def.tags.every(isNonEmptyString), component)
      failif.ComponentNameDuplicate(this.components.hasOwnProperty(def.name), component)

      // preserve existing this bindings just in case
      def.factory = def.factory.bind(d)

      this.components[def.name] = def
    })
    return this
  }

  resolve (dependency) {
    return new Injector(this).resolve(dependency)
  }

  inject (dependencies, factory) {
    let deps = flatten(list(arguments))
    let f = null
    if (deps.length && deps[deps.length - 1] && isFunction(deps[deps.length - 1])) {
      f = deps.pop()
    }

    failif.DependencyIsNotString(!deps.every(isNonEmptyString), deps)

    return new Injector(this).inject(deps, f)
  }
}

function isFunction (v) {
  return typeof v === 'function'
}
function isNonEmptyString (v) {
  return (typeof v === 'string') && v
}

function factory () {
  return new Container()
}
factory.Container = Container

module.exports = factory
