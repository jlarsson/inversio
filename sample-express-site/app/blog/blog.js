'use strict'

var debug = require('debug')('sample')
var jade = require('jade')

module.exports = setupRoutes

function setupRoutes (app, db) {
  debug('blog: creating routes')
  return app.get('/blog/:id', function (req, res) {
    res.send(jade.renderFile(__dirname + '/post.jade', db.get(req.params.id)))
  })
}
