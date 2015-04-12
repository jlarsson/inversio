'use strict'

var debug = require('debug')('inversio')
var _ = require('lodash')
var failif = require('./failif')

module.exports = Injector

function Injector (container) {
  this.container = container
  this.components = this.container.components
  this.resolved = this.container.resolved
  this.namespaces = this.container.namespaces
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
    return (
      this.tryResolveWithNamespace(name)
      || this.tryResolve(name)
      || this.resolveFail(name)
    )
  } catch(err) {
    return Promise.reject(err)
  }
}

proto.tryResolve = function injector$tryResolve (name) {
  if (!this.components.hasOwnProperty(name)) {
    return null
  }

  failif.CircularDependency(this.resolving.hasOwnProperty(name), {
    component: name,
    resolving: _.keys(this.resolving)
  })

  this.resolving[name] = true
  var component = this.components[name]

  this.resolved[name] = Promise.all(
      _.map(component.depends, function (dependency) {
        debug('dependency(%s)', dependency)
        return this.resolve(dependency)
      }.bind(this)))
    .then(function (r) {
      delete this.resolving[name]
      return r
    }.bind(this))
    .then(function (resolvedDependencies) {
      return component.factory.apply(null, resolvedDependencies)
    })

  return this.resolved[name]
}

proto.tryResolveWithNamespace = function injector$tryResolveWithNamespace (name) {
  if (name.indexOf(':') < 0) {
    return null
  }

  failif.CircularDependency(this.resolving.hasOwnProperty(name), {
    component: name,
    resolving: _.keys(this.resolving)
  })

  this.resolving[name] = true

  var nameParts = name.split(':')
  var ns = nameParts[0]

  failif.UnknownNamespace(!this.namespaces.hasOwnProperty(ns), name)
  var nsvalue = name.substring(ns.length + 1)

  var nshandler = this.namespaces[ns]
  debug('namespace dependency(%s)', name)

  var nsresolved = nshandler.resolve(
    this.resolve.bind(this),
    ns, nsvalue, _.values(this.components)
  )

  return (_.isArray(nsresolved)
    ? Promise.all(nsresolved)
    : Promise.resolve(nsresolved))
    .then(function (v) {
      delete this.resolving[name]
      return v
    }.bind(this))
}

proto.resolveFail = function injector$resolveFail (name) {
  failif.UnresovableDependency(true, {
    component: name,
    resolving: _.keys(this.resolving)
  })
}
