'use strict'

module.exports.register = function (inversio) {
  inversio.component({
    name: 'blog-route',
    depends: ['app', 'db'],
    tags: ['route'],
    factory: require('./blog')
  })
}
