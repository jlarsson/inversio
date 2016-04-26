'use strict'

let Promise = require('any-promise')

module.exports = function optionalBinder (name, resolve, components) {
  if (name.indexOf('?') !== 0) {
    return
  }
  var componentName = name.substring(1)

  return {
    resolved: components.hasOwnProperty(componentName)
      ? resolve(componentName)
      : Promise.resolve(undefined)
    }
}
