'use strict'

module.exports = function optionalBinder (name, injector) {
  if (name.indexOf('?') !== 0) {
    return
  }
  var componentName = name.substring(1)

  return {
    resolved: injector.components.hasOwnProperty(componentName)
      ? injector.resolve(componentName)
      : Promise.resolve(undefined)
  }
}
