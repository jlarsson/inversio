'use strict'

var util = require('util')
var reduce = require('lodash').reduce

module.exports = reduce({
    'ServiceNameDuplicate': 'A service with that name is alread registered (%j)',
    'ServiceNameIsEmpty': 'The service name cannot be empty (%j)',
    'ServiceNameIsNotString': 'The service name must be a string (%j)',
    'ServiceHasNoFactory': 'factory must specified (%j)',
    'ServiceFactoryIsNotFunction': 'factory must be a function (%j)',
    'ServiceDependsNotArray': 'Dependencies must be an array (%j)',
    'ServiceTagsNotArray': 'tags must be an array (%j)',
    'DependencyIsNotString': 'Dependencies must be strings (%j)',
    'UnresovableDependency': 'Unable to resolve dependency (%j)',
    'CircularDependency': 'Circular dependency (%j)',
    'UnknownNamespace': 'Unknown namespace for dependency (%s)'
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
        error.garcon_reason = name
        throw error
      }
    }
    return obj
  }, {})
