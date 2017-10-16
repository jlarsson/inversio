'use strict'

// var debug = require('debug')('inversio')
var Promise = require('any-promise')
var failif = require('./failif')

class Injector {
  constructor (container) {
    this.container = container
    this.components = this.container.components
    this.resolved = this.container.resolved
    this.binders = this.container.binders
    this.resolving = {}
  }

  inject (dependencies, factory) {
    // resolve all dependencies in an orderly fashion
    // to avoid weirdness
    // Use of Promise.all() might throw CircularException
    // due to concurrent but unfinished activations
    return dependencies.reduce((p, dependency) => p.then(
      l => this.resolve(dependency).then(
        d => {
          l.push(d)
          return l
        })
      ), Promise.resolve([]))
    .then(resolvedDependencies => factory ? factory.apply(null, resolvedDependencies) : resolvedDependencies)
  }

  resolve (name) {
    return new Promise((resolve, reject) => {
      failif.ComponentNameIsNotString(typeof name !== 'string')
      // Quick result if component is resolved
      if (this.resolved.hasOwnProperty(name)) {
        return resolve(this.resolved[name])
      }
      // Quick fail if currently in progress of resolving
      failif.CircularDependency(this.resolving.hasOwnProperty(name), {
        component: name,
        resolving: Object.keys(this.resolving)
      })
      // Mark as resolve in progress
      this.resolving[name] = true

      // Consult all binders for a result {resolved: ...}
      this.binders.reduce((p, binder) => p.then(
        bound => bound || binder(name, this)),
        Promise.resolve(null))
      .then(bound => {
        // fail if no binder was positive
        failif.UnresolvableDependency(!bound, {
          component: name,
          resolving: Object.keys(this.resolving)
        })
        return bound.resolved
      })
      // This chain of then() is important since it
      // forces a settled value before we mark
      // this.resolve(name) as complete
      .then(resolved => (this.resolved[name] = resolved))
      .then(() => this.resolved[name])
      .then(resolve, reject)
    })
  }
}

module.exports = Injector
