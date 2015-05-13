'use strict'

var _ = require('lodash')
var failif = require('./failif')
var Injector = require('./injector')

function Container () {
  if (!(this instanceof Container)) {
    return new Container()
  }
  this.components = {}
  this.resolved = {}
  this.binders = [
    require('./default-binder'),
    require('./optional-binder'),
    require('./require-binder'),
    require('./tag-binder')
  ]
}

var proto = Container.prototype

proto.component = function container$component (component) {
  _(arguments).flatten().each(function (d) {
    var def = _.defaults({}, d, {depends: [], tags: []})

    failif.ComponentNameIsEmpty(!def.name, component)
    failif.ComponentNameIsNotString(typeof def.name !== 'string', component)
    failif.ComponentHasNoFactory(!def.factory, component)
    failif.ComponentFactoryIsNotFunction(!(def.factory instanceof Function), component)
    failif.ComponentDependsNotArray(!_.isArray(def.depends), component)
    failif.ComponentTagsNotArray(!_.isArray(def.tags), component)
    failif.ComponentNameDuplicate(this.components.hasOwnProperty(def.name), component)

    this.components[def.name] = def
  }.bind(this)).value()
  return this
}

proto.resolve = function container$resolve (dependency) {
  return new Injector(this).resolve(dependency)
}

proto.inject = function container$inject (dependencies, factory) {
  var deps = _.flatten(arguments)
  var f = null
  if (deps.length && deps[deps.length - 1] && _.isFunction(deps[deps.length - 1])) {
    f = deps.pop()
  }

  failif.DependencyIsNotString(!_.every(deps, isNonEmptyString), deps)

  return new Injector(this).inject(deps, f)
}

function isNonEmptyString (v) {
  return (typeof v === 'string') && v
}

module.exports = Container
