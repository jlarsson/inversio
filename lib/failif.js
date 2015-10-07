'use strict'

var util = require('util')
var debug = require('debug')('inversio')
var reduce = require('lodash').reduce

module.exports = reduce(
  {
    'ComponentNameDuplicate': 'A component with that name is alread registered (%j)',
    'ComponentNameIsEmpty': 'The component name cannot be empty (%j)',
    'ComponentNameIsNotString': 'The component name must be a string (%j)',
    'ComponentHasNoFactory': 'Component factory must specified (%j)',
    'ComponentFactoryIsNotFunction': 'Component factory must be a function (%j)',
    'ComponentDependsNotArray': 'Dependencies must be an array (%j)',
    'ComponentTagsNotArray': 'Component tags must be an array (%j)',
    'DependencyIsNotString': 'Dependencies must be strings (%j)',
    'UnresolvableDependency': 'Unable to resolve dependency (%j)',
    'CircularDependency': 'Circular dependency (%j)'
  },
  function (obj, format, name) {
    obj[name] = function (fail /* ,...args */) {
      if (fail) {
        var args = [format]
        for (var i = 1; i < arguments.length; ++i) {
          args.push(arguments[i])
        }
        var message = util.format.apply(null, args)
        var error = new Error(message)
        error.code = name
        debug('Throwing %s', error)
        throw error
      }
    }
    return obj
  }, {})
