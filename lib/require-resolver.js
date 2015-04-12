'use strict'

var debug = require('debug')('inversio')

module.exports = RequireResolver

function RequireResolver () {
  if (!(this instanceof RequireResolver)) {
    return new RequireResolver()
  }
}

var proto = RequireResolver.prototype

proto.resolve = function (resolve, ns, value, components) {
  debug('resolving module %s', value)
  return require(value)
}
