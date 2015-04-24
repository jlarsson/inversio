'use strict'

var debug = require('debug')('inversio')

module.exports = function requireBinder (name, resolve, components) {
  if (name.indexOf('require:') !== 0) {
    return
  }
  var moduleName = name.substring(8)
  debug('resolving module %s', moduleName)
  return {
    resolved: require(moduleName)
  }
}
