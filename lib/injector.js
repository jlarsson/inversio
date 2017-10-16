'use strict'

// var debug = require('debug')('inversio')
var Promise = require('any-promise')
var failif = require('./failif')

const UNRESOLVED = {unresolved: 'unresolved'}

class Injector {
  constructor (container) {
    this.container = container
    this.components = this.container.components
    this.resolved = this.container.resolved
    this.binders = this.container.binders
    this.resolving = {}
  }

  inject (dependencies, factory) {
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
    return (this.resolved[name] || this.tryResolve(name))
      .then(resolved => {
        failif.UnresolvableDependency(resolved === UNRESOLVED, {
          component: name,
          resolving: Object.keys(this.resolving)
        })
        return resolved
      })
  }

  tryResolve (name) {
    failif.CircularDependency(this.resolving.hasOwnProperty(name), {
      component: name,
      resolving: Object.keys(this.resolving)
    })
    this.resolving[name] = true

    // var binderResolve = this.binderResolve.bind(this)
    var bound = this.binders.reduce((p, binder) => p.then(
        bound => bound || binder(name, this)),
        Promise.resolve(null))

    return bound.then(bound => {
      delete this.resolving[name]
      if (bound) {
        let resolvedPromise = Array.isArray(bound.resolved) ? Promise.all(bound.resolved) : Promise.resolve(bound.resolved)
        this.resolved[name] = resolvedPromise
        return this.resolved[name]
      }
      return UNRESOLVED
    })
  }
}

module.exports = Injector
