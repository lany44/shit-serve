'use strict'

var path = require('path')
var fs = require('fs')
var mongoose = require('mongoose')
var Promise = require('bluebird')
var uuid = require('uuid')
var Mdse = mongoose.model('Mdse')
var xss = require('xss')


exports.save = function *(next) {
  const user = this.session.user
  const body = this.request.body
  const img = this.request.files.image
  const file_name =  uuid.v4() + path.extname(img.name)
  const target_path = './images/' + file_name

  fs.createReadStream(img.path)
    .pipe(fs.createWriteStream(target_path))

  var mdse = yield Mdse.findOne({
    author: user._id,
    title: xss(body.title)
  }).exec()

  if (!mdse) {
    var mdseData = {
      author: user._id,
      title: xss(body.title),
      img: file_name,
      desc: body.desc,
      position: body.position,
      price: Number(body.price),
      percent: Number(body.percent),
      detail: body.detail
    }

    mdse = new Mdse(mdseData)

    mdse = yield mdse.save()
  }

  console.log(mdse)

  this.body = {
    success: true,
    data: {
      _id: mdse._id,
      title: mdse.title,
      img: file_name,
      title: mdse.title,
      desc: mdse.desc,
      position: mdse.position,
      price: mdse.price,
      percent: mdse.percent,
      detail: mdse.detail,
      meta: mdse.meta,
      author: {
        _id: user._id,
        nickname: user.nickname,
        phoneNumber: user.phoneNumber
      }
    }
  }
}


exports.getAll = function *(next) {
  const userFields = [
    'nickname',
    'phoneNumber'
  ]
  const mdse_list = yield Mdse.find({})
      .sort({
        'meta.createAt': -1
      })
      .populate('author', userFields.join(' '))
      .exec()

  this.body = {
    success: true,
    data: mdse_list
  }
}

exports.getByIds = function *(next) {
  const user = this.session.user
  const id_list = user.fav_mdse_list

  const userFields = [
    'nickname',
    'phoneNumber'
  ]
  const mdse_list = yield Mdse.find({
    _id: {
       "$in" : id_list
    }
  })
      .populate('author', userFields.join(' '))
      .exec()

  console.log(mdse_list)    

  this.body = {
    success: true,
    data: mdse_list
  }
}
