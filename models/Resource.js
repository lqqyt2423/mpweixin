'use strict';

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const config = require('../config');

const Resource = new Schema({
  name: { type: 'String' },
  filename: { type: 'String' },
  from: { type: 'String' },
  deletedAt: { type: 'Date' }
}, config.mongoose);

Resource.plugin(require('mongoose-timestamp'));
mongoose.model('Resource', Resource);
