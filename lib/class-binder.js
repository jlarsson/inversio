'use strict'

module.exports = function classBinder (name, injector) {
  if (!(/^class:/.test(name))) {
    return
  }

  let className = name.substring(6)

  let classFromSuperAndMixins = injector
    .inject(['super:' + className, 'tag:extends:' + className],
      (cls, mixins) => mixins.filter(mixin => mixin).reduce((c, m) => m(c), cls))

  return {
    resolved: classFromSuperAndMixins
  }
}
