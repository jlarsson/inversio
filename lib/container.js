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
    list(arguments).forEach(component => {
      let def = Object.assign({}, {depends: [], tags: []}, component)
      if (def.hasOwnProperty('name')) {
        failif.ComponentNameIsEmpty(!def.name, def)
        failif.ComponentNameIsNotString(typeof def.name !== 'string', def)
      }
      if (!def.hasOwnProperty('name')) {
        // unnamed components are valid if tags are specified
        failif.ComponentNameIsEmpty(def.tags.length === 0, def)
        def.name = `[anonymous-${++this.nextAnonymous}]`
      }

      failif.ComponentHasNoFactory(!def.factory, def)
      failif.ComponentFactoryIsNotFunction(!(def.factory instanceof Function), def)
      failif.ComponentDependsNotArray(!Array.isArray(def.depends), def)
      failif.ComponentTagsNotArray(!Array.isArray(def.tags), def)
      failif.ComponentTagsNotStringArray(!def.tags.every(isNonEmptyString), def)

      failif.ComponentNameDuplicate(
        this.components.hasOwnProperty(def.name) &&
        !this.components[def.name].timid,
        def)

      failif.ComponentNameDuplicate(
        this.components.hasOwnProperty(def.name) &&
        this.resolved.hasOwnProperty(def.name) &&
        !this.resolved[def.name].timid,
        def)

      // preserve existing this bindings just in case
      def.factory = def.factory.bind(component)

      this.components[def.name] = def
    })
    return this
  }

  resolve (dependency) {
    // return new Injector(this).resolve(dependency)
    return this.inject(dependency, resolved => resolved)
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
