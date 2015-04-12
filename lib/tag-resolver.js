'use strict'

var _ = require('lodash')

module.exports = TagResolver

function TagResolver () {
  if (!(this instanceof TagResolver)) {
    return new TagResolver()
  }
}

var proto = TagResolver.prototype

proto.resolve = function (resolve, ns, value, components) {
  return _(components).map(function (component) {
    if (_(component.tags).contains(value)) {
      return resolve(component.name)
    }
    return null
  })
  .filter()
  .value()
}
