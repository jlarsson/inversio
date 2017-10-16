'use strict'

module.exports = function tagBinder (name, injector) {
  if (name.indexOf('tag:') !== 0) {
    return
  }
  var tag = name.substring(4)

  let taggedComponentNames = Object.keys(injector.components)
    .map(key => injector.components[key])
    .filter(component => component.tags.indexOf(tag) >= 0)
    .sort((c1, c2) => (c1.order || 0) - (c2.order || 0))
    .map(component => component.name)

  return {
    resolved: injector.inject(taggedComponentNames)
  }
}
