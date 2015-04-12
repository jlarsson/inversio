'use strict'

var debug = require('debug')('sample')
var inversio = require('../')

var port = 3000

var modules = [
  './app/express',
  './app/index',
  './app/blog',
  './app/db'
]

modules.map(function (name) {
  debug('loading module %s', name)
  return {name: name, module: require(name + '/component.js')}
})
.reduce(function (inversio, module) {
  debug('registering module %s', module.name)
  module.module.register(inversio)
  return inversio
}, inversio())
.inject('app', 'tag:route', function (app) {
  debug('express apllication listing to port %s', port)
  app.listen(port)
})
