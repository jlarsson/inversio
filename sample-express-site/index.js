'use strict'

var inversio = require('../')
var thenify = require('thenify')
var glob = thenify(require('glob'))

var port = 3000

var log = console.log
glob('app/**/*.component.js')
  .then(function requireComponents (componentFiles) {
    return componentFiles.map(function (componentFile) {
      log('loading component %s', componentFile)
      return {
        file: componentFile,
        module: require('./' + componentFile)
      }
    })
  })
  .then(function registerComponents (components) {
    return components.reduce(function (container, component) {
      log('registering component %s', component.file)
      component.module.register(container)
      return container
    },
    inversio())
  })
  .then(function (container) {
    log('resolving express app and all routes')
    return container.inject('app', 'tag:route', function (app) {
      return app
    })
  })
  .then(function (app) {
    log('express application listing to port %s', port)
    app.listen(port)
  })

/*
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
  console.log('express application listing to port %s', port)
  app.listen(port)
})
*/
