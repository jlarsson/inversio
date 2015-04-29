'use strict'

module.exports.register = function (container) {
  container.component({
    name: 'blog-route',
    depends: ['app', 'db'],
    tags: ['route'],
    factory: require('./blog')
  })
}
