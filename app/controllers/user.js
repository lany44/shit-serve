'use strict'

var xss = require('xss')
var mongoose = require('mongoose')
var User = mongoose.model('User')
var uuid = require('uuid')
var sms = require('../service/sms')


exports.signup = function *(next) {
  var phoneNumber = xss(this.request.body.phoneNumber.trim())

  var user = yield User.findOne({
    phoneNumber: phoneNumber
  }).exec()

  var verifyCode = sms.getCode()

  if (!user) {
    var accessToken = uuid.v4()

    user = new User({
      nickname: '用户名未设置',
      avatar: 'default',
      phoneNumber: xss(phoneNumber),
      verifyCode: verifyCode,
      accessToken: accessToken
    })

  }
  else {
    this.body = {
      success: false,
      err: '啊哦，该号码已经被注册了'
    }
    return next
  }

  try {
    user = yield user.save()
  }
  catch (e) {
    this.body = {
      success: false,
      err: '啊哦，出错了'
    }

    return next
  }

  var msg = '您的注册验证码是：' + user.verifyCode

  try {
    sms.send(user.phoneNumber, msg)
  }
  catch (e) {
    console.log(e)

    this.body = {
      success: false,
      err: '短信服务异常'
    }

    return next
  }

  this.body = {
    success: true
  }
}

exports.verify = function *(next) {
  var verifyCode = this.request.body.verifyCode
  var phoneNumber = this.request.body.phoneNumber
  var nickname = this.request.body.nickname
  var password = this.request.body.password

  if (!verifyCode || !phoneNumber) {
    this.body = {
      success: false,
      err: '验证没通过'
    }

    return next
  }

  var user = yield User.findOne({
    phoneNumber: phoneNumber,
    verifyCode: verifyCode
  }).exec()

  if (user) {
    user.verified = true
    user.nickname = nickname
    user.password = password
    user = yield user.save()

    this.body = {
      success: true,
      data: {
        nickname: user.nickname,
        accessToken: user.accessToken,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
        _id: user._id
      }
    }
  }
  else {
    this.body = {
      success: false,
      err: '错误的验证码'
    }
  }
}

exports.login = function *(next) {
  var phoneNumber = this.request.body.phoneNumber
  var password = this.request.body.password

  var user = yield User.findOne({
    phoneNumber: phoneNumber
  }).exec()

  if (user.verified) {
    var accessToken = uuid.v4()
    user.accessToken = accessToken
    user = yield user.save()

    this.body = {
      success: true,
      data: {
        nickname: user.nickname,
        accessToken: user.accessToken,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
        _id: user._id
      }
    }
  }
  else {
    this.body = {
      success: false,
      err: '密码错误或用户未激活'
    }
  }
  return next

}

exports.getFavStatus = function *(next) {
  const user = this.session.user
  var mdse_id = this.request.body.mdse_id

  if (user.fav_mdse_list.indexOf(mdse_id) !== -1) {
    this.body = {
      success: true,
      isFav: true
    }
  } else {
    this.body = {
      success: true,
      isFav: false
    }
  }
  return next
}


exports.star = function *(next) {
  const user = this.session.user
  var mdse_id = this.request.body.mdse_id
  var phoneNumber = user.phoneNumber

  var _user = yield User.findOne({
    phoneNumber: phoneNumber
  })

  let isFav;

  if (_user.fav_mdse_list.indexOf(mdse_id) !== -1) {
    let index = _user.fav_mdse_list.indexOf(mdse_id)
    _user.fav_mdse_list.splice(index, 1);
    isFav = false
  } else {
    _user.fav_mdse_list.push(mdse_id)
    isFav = true
  }
  yield _user.save()

  this.body = {
    success: true,
    isFav
  }

  return next

}
