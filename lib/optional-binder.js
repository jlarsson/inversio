'use strict'

module.exports = function optionalBinder (name, resolve, components) {
  if (name.indexOf('?') !== 0) {
    return
  }
  var componentName = name.substring(1)

  return {
    resolved: components.hasOwnProperty(componentName)
      ? resolve(componentName)
      : undefined
    }
}
