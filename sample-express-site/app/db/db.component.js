'use strict'

var debug = require('debug')('sample')

module.exports.register = function (container) {
  container.component({
    name: 'db',
    factory: createDatabase
  })
}

function createDatabase () {
  debug('creating database')
  // we return a fake database
  return {
    get: function (key) {
      return {title: key, body: 'sample text for ' + key}
    }
  }
}
