'use strict';

require('./connect');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Resource = new Schema({
  name: { type: 'String' },
  filename: { type: 'String' },
  from: { type: 'String' },
  deletedAt: { type: 'Date' }
});

Resource.plugin(require('mongoose-timestamp'));
module.exports = mongoose.model('Resource', Resource);
