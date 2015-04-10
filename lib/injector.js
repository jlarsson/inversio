'use strict'

var debug = require('debug')('garcon')
var _ = require('lodash')
var failif = require('./failif')

module.exports = Injector

function Injector(container) {
  this.container = container
  this.services = this.container.services
  this.resolved = this.container.resolved
  this.namespaces = this.container.namespaces
  this.resolving = {}
}

var proto = Injector.prototype

proto.inject = function(dependencies, factory) {
  debug('inject(%s, () => {})', dependencies)
  var deps = _.map(dependencies, function(dependency) {
    return this.resolve(dependency)
  }.bind(this))

  return Promise.all(deps)
    .then(function(resolvedDependencies) {
      debug('%s -> %j', dependencies, resolvedDependencies)
      return factory.apply(null, resolvedDependencies)
    })
}

proto.resolve = function(name) {
  debug('resolve(%s)', name)

  if (this.resolved.hasOwnProperty(name)) {
    return this.resolved[name]
  }

  failif.CircularDependency(this.resolving.hasOwnProperty(name), {
    service: name,
    resolving: _.keys(this.resolving)
  })

  this.resolving[name] = true

  // Look for namespaces
  if (name.indexOf(':') >= 0) {
    var nameParts = name.split(':')
    var ns = nameParts[0]

    failif.BadNamespace(!this.namespaces.hasOwnProperty(ns), name)
    var nsvalue = name.substring(ns.length + 1)

    var nshandler = this.namespaces[ns]
    debug('namespace dependency(%s)', name)
    return Promise.all(nshandler.resolve(
      this.resolve.bind(this),
      ns, nsvalue, _.values(this.services)
    ))
  }

  failif.UnresovableDependency(!this.services.hasOwnProperty(name), {
    service: name,
    resolving: _.keys(this.resolving)
  })
  var service = this.services[name]

  this.resolved[name] = Promise.all(
      _.map(service.depends, function(dependency) {
        debug('dependency(%s)', dependency)
        return this.resolve(dependency)
      }.bind(this)))
    .then(function(r) {
      delete this.resolving[name]
      return r
    }.bind(this))
    .then(function(resolvedDependencies) {
      return service.factory.apply(null, resolvedDependencies)
    })

  return this.resolved[name]
}
