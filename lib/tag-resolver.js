'use strict'

var Promise = require('native-or-bluebird')
var _ = require('lodash')

module.exports = TagResolver

function TagResolver () {
  if (!(this instanceof TagResolver)) {
    return new TagResolver()
  }
}

var proto = TagResolver.prototype

proto.resolve = function (resolver, ns, value, services) {
  return _(services).map(function (service) {
    if (_(service.tags).contains(value)) {
      return resolver(service.name)
    }
    return null
  })
  .filter()
  .value()
}
