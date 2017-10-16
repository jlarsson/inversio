'use strict'

var util = require('util')

const fails = {
  'ComponentNameDuplicate': 'A component with that name is alread registered (%j)',
  'ComponentNameIsEmpty': 'The component name cannot be empty (%j)',
  'ComponentNameIsNotString': 'The component name must be a string (%j)',
  'ComponentHasNoFactory': 'Component factory must specified (%j)',
  'ComponentFactoryIsNotFunction': 'Component factory must be a function (%j)',
  'ComponentDependsNotArray': 'Dependencies must be an array (%j)',
  'ComponentTagsNotArray': 'Component tags must be an array (%j)',
  'ComponentTagsNotStringArray': 'Component tags must be an array of strings (%j)',
  'DependencyIsNotString': 'Dependencies must be strings (%j)',
  'UnresolvableDependency': 'Unable to resolve dependency (%j)',
  'CircularDependency': 'Circular dependency (%j)'
}

module.exports = Object.keys(fails).map(key => ({key, value: fails[key]}))
  .reduce((memo, kv) => {
    memo[kv.key] = function (fail /* ,...args */) {
      if (fail) {
        var args = [kv.value]
        for (var i = 1; i < arguments.length; ++i) {
          args.push(arguments[i])
        }
        var message = util.format.apply(null, args)
        var error = new Error(message)
        error.code = kv.key
        throw error
      }
    }
    return memo
  }, {})
