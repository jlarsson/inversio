'use strict'

var debug = require('debug')('sample')
var jade = require('jade')

module.exports = setupRoutes

function setupRoutes (app) {
  debug('index: creating routes')
  return app.get('/', function (req, res) {
    res.send(jade.renderFile(__dirname + '/index.jade', {}))
  })
}
