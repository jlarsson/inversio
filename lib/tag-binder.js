'use strict'

var _ = require('lodash')

module.exports = function tagBinder (name, resolve, components) {
  if (name.indexOf('tag:') !== 0) {
    return
  }
  var tag = name.substring(4)

  var resolved = _(components)
    .filter(function (component) {
      return _(component.tags).contains(tag)
    })
    .sortBy(function (component) {
      return component.order || 0
    })
    .map(function (component) {
      return resolve(component.name)
    })
    .value()

  return {
    resolved: resolved
  }
}
