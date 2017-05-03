'use strict'

var Router = require('koa-router')
var User = require('../app/controllers/user')
var App = require('../app/controllers/app')
var Mdse = require('../app/controllers/mdse')
var Comment = require('../app/controllers/comment')

module.exports = function() {
  var router = new Router({
    prefix: '/api'
  })

  // user
  router.post('/u/signup', App.hasBody, User.signup)
  router.post('/u/verify', App.hasBody, User.verify)
  router.post('/u/login', App.hasBody, User.login)
  router.post('/u/star', App.hasBody, App.hasToken, User.star)
  router.post('/u/getFavStatus', App.hasBody, App.hasToken, User.getFavStatus)
  router.post('/u/getFav', App.hasBody, App.hasToken, Mdse.getByIds)

  // mdse
  router.post('/mdse/getAll', Mdse.getAll)
  router.post('/mdse/publish', App.hasToken, Mdse.save)

  // comments
  router.get('/comments', App.hasToken, Comment.find)
  router.post('/comments', App.hasBody, App.hasToken, Comment.save)

  return router
}
