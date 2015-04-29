'use strict'

module.exports.register = function (container) {
  container.component({
    name: 'index-route',
    depends: ['app'],
    tags: ['route'],
    factory: require('./index')
  })
}
