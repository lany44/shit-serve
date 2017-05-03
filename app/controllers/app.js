'use strict'

var mongoose = require('mongoose')
var uuid = require('uuid')
var User = mongoose.model('User')

exports.hasBody = function *(next) {
  var body = this.request.body || {}

  if (Object.keys(body).length === 0) {
    this.body = {
      success: false,
      err: '是不是漏掉什么了'
    }

    return next
  }

  yield next
}

exports.hasToken = function *(next) {
  var accessToken = this.request.body.accessToken
  var phoneNumber = this.request.body.phoneNumber

  accessToken = accessToken ? accessToken : this.request.headers['access-token']
  phoneNumber = phoneNumber ? phoneNumber : this.request.headers['phone-number']

  if (!accessToken) {
    this.body = {
      success: false,
      err: '钥匙丢了'
    }

    return next
  }

  var user = yield User.findOne({
    phoneNumber: phoneNumber,
    accessToken: accessToken
  })
  .exec()

  if (!user) {
    this.body = {
      success: false,
      err: '用户没登陆'
    }

    return next
  }

  this.session = this.session || {}
  this.session.user = user

  yield next
}


exports.assets = function *(next) {

  console.log(this.request)
  // var pathname = url.parse(request.url).pathname;
  // let content = fs.readFileSync(filePath, 'binary')
  this.body = {

  }
  yield next
}
