'use strict'

var debug = require('debug')('garcon')

module.exports = RequireResolver

function RequireResolver () {
  if (!(this instanceof RequireResolver)) {
    return new RequireResolver()
  }
}

var proto = RequireResolver.prototype

proto.resolve = function (resolve, ns, value, services) {
  debug('resolving module %s', value)
  return require(value)
}
