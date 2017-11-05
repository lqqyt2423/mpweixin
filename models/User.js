'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('../config');

const User = new Schema({
  name: { type: 'String' }
}, config.mongoose);

// 插件
User.plugin(require('mongoose-timestamp'));

mongoose.model('User', User);
