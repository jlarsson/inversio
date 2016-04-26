'use strict'

var debug = require('debug')('inversio')
var Promise = require('any-promise')
var _ = require('lodash')
var failif = require('./failif')

module.exports = Injector

function Injector (container) {
  this.container = container
  this.components = this.container.components
  this.resolved = this.container.resolved
  this.binders = this.container.binders
  this.resolving = {}
}

var proto = Injector.prototype

proto.inject = function injector$inject (dependencies, factory) {
  debug('inject(%s, () => {})', dependencies)
  var promises = _.map(dependencies, function (dependency) {
    return this.resolve(dependency)
  }.bind(this))

  return Promise.all(promises)
    .then(function (values) {
      debug('%s -> %j', dependencies, values)
      return factory ? factory.apply(null, values) : values
    })
}

proto.resolve = function injector$resolve (name) {
  debug('resolve(%s)', name)

  if (this.resolved.hasOwnProperty(name)) {
    return this.resolved[name]
  }
  try {
    return this.tryResolve(name)
  } catch(err) {
    return Promise.reject(err)
  }
}

proto.tryResolve = function injector$tryResolve (name) {
  failif.CircularDependency(this.resolving.hasOwnProperty(name), {
    component: name,
    resolving: _.keys(this.resolving)
  })

  this.resolving[name] = true

  var binderResolve = this.binderResolve.bind(this)
  var components = this.components

  var bound
  for (var i = 0; i < this.binders.length; ++i) {
    var binding = this.binders[i](name, binderResolve, components)
    if (binding && binding.hasOwnProperty('resolved')) {
      bound = binding
      break
    }
  }

  failif.UnresolvableDependency(!bound, {
    component: name,
    resolving: _.keys(this.resolving)
  })

  debug('bound: %j', bound)
  delete this.resolving[name]

  // this.resolved[name] = _.isArray(bound.resolved) ? Promise.all(bound.resolved) : Promise.resolve(bound.resolved)
  this.resolved[name] = _.isArray(bound.resolved) ? Promise.all(bound.resolved) : bound.resolved
  return this.resolved[name]
}

proto.binderResolve = function injector$binderResolve (name) {
  failif.UnresolvableDependency(!this.components.hasOwnProperty(name), {
    component: name,
    resolving: _.keys(this.resolving)
  })

  var component = this.components[name]

  return Promise.all(
      _.map(component.depends, function (dependency) {
        debug('dependency(%s)', dependency)
        return this.resolve(dependency)
      }.bind(this)))
    .then(function (resolvedDependencies) {
      var v = component.factory.apply(null, resolvedDependencies)
      debug('resolved %s -> %j', name, v)
      return v
    })
}
