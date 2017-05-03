'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId

var MdseSchema = new Schema({
  author: {
    type: ObjectId,
    ref: 'User'
  },

  title: String,
  img: String,
  desc: String,
  position: String,
  price: Number,
  percent: Number,
  detail: String,

  meta: {
    createAt: {
      type: Date,
      dafault: Date.now()
    },
    updateAt: {
      type: Date,
      dafault: Date.now()
    }
  }
})

MdseSchema.pre('save', function(next) {
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

  next()
})

module.exports = mongoose.model('Mdse', MdseSchema)
