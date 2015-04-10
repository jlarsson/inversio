'use strict'

var _ = require('lodash')
var failif = require('./failif')
var Injector = require('./injector')

function Container () {
  if (!(this instanceof Container)) {
    return new Container()
  }
  this.services = {}
  this.resolved = {}
  this.namespaces = {
    'require': require('./require-resolver')(),
    'tag': require('./tag-resolver')()
  }
}

var proto = Container.prototype

proto.service = function container$service (serviceDefinition) {
  _(arguments).flatten().each(function (d) {
    var def = _.defaults({}, d, {depends: [], tags: []})

    failif.ServiceNameIsEmpty(!def.name, serviceDefinition)
    failif.ServiceNameIsNotString(typeof def.name !== 'string', serviceDefinition)
    failif.ServiceHasNoFactory(!def.factory, serviceDefinition)
    failif.ServiceFactoryIsNotFunction(!(def.factory instanceof Function), serviceDefinition)
    failif.ServiceDependsNotArray(!_.isArray(def.depends), serviceDefinition)
    failif.ServiceTagsNotArray(!_.isArray(def.tags), serviceDefinition)
    failif.ServiceNameDuplicate(this.services.hasOwnProperty(def.name), serviceDefinition)

    this.services[def.name] = def
  }.bind(this)).value()
  return this
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
