'use strict'

module.exports = function requireBinder (name, injector) {
  if (name.indexOf('require:') !== 0) {
    return
  }
  var moduleName = name.substring(8)
  return {
    resolved: require(moduleName)
  }
}
