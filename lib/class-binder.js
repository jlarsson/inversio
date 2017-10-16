'use strict'

module.exports = function optionalBinder (name, injector) {
  if (!(/^class:/.test(name))) {
    return
  }

  let className = name.substring(6)
  return {
    resolved: injector.resolve('super:' + className)
      .then(cls => injector.resolve('tag:extends:' + className)
        .then(mixins => mixins.filter(mixin => mixin).reduce((c, m) => m(c), cls)))
  }
}
