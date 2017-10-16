'use strict'

module.exports = function defaultBinder (name, injector) {
  if (injector.components.hasOwnProperty(name)) {
    var component = injector.components[name]

    return {
      resolved: injector.inject(component.depends, component.factory)
    }
  }
}
