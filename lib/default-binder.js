'use strict'

var debug = require('debug')('inversio:default-binder')

module.exports = function defaultBinder (name, resolve, components) {
  if (components.hasOwnProperty(name)) {
    debug('resolving %s', name)
    return {
      resolved: resolve(name)
    }
  }
}
