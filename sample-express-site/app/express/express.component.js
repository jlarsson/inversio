'use strict'

var debug = require('debug')('sample')
var express = require('express')

module.exports.register = function (container) {
  container.component({
    name: 'app',
    factory: createApp
  })
}

function createApp () {
  debug('creating express app')
  var app = express()
  // app.use(express.static('public'))
  return app
}
