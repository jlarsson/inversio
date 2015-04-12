'use strict'

module.exports.register = function (inversio) {
  inversio.component({
    name: 'index-route',
    depends: ['app'],
    tags: ['route'],
    factory: require('./index')
  })
}
