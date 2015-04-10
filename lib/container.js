'use strict'

var _ = require('lodash')
var failif = require('./failif')
var Injector = require('./injector')
var tags = require('./tag-resolver')

function Container () {
  if (!(this instanceof Container)) {
    return new Container()
  }
  this.services = {}
  this.resolved = {}
  this.namespaces = {
    'tag': tags()
  }
}

var proto = Container.prototype

proto.service = function (serviceDefinition) {
  var def = _.defaults({}, serviceDefinition, {depends: [], tags: []})

  failif.ServiceNameIsEmpty(!def.name, serviceDefinition)
  failif.ServiceNameIsNotString(typeof def.name !== 'string', serviceDefinition)
  failif.ServiceHasNoFactory(!def.factory, serviceDefinition)
  failif.ServiceFactoryIsNotFunction(!(def.factory instanceof Function), serviceDefinition)
  failif.ServiceDependsNotArray(!_.isArray(def.depends), serviceDefinition)
  failif.ServiceTagsNotArray(!_.isArray(def.tags), serviceDefinition)
  failif.ServiceNameDuplicate(this.services.hasOwnProperty(def.name), serviceDefinition)

  this.services[def.name] = def
  return this
}

proto.inject = function (dependencies, factory) {
  return new Injector(this).inject(dependencies, factory)
}

module.exports = Container
