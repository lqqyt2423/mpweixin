'use strict';

const mongoose = require('mongoose');
const path = require('path');
const debug = require('debug')('mpweixin:models');

// 设置 mongoose 的 promise 支持为 bluebird
mongoose.Promise = require('bluebird');

// 载入 mongoose 插件
require('./plugins/paginator');

const config = require('../config');

mongoose.connect(
  config.database.mongodb.db,
  config.database.mongodb.options || {},
  function (err) {
    if (err) {
      debug('connect to %s error: ', config.database.mongodb.db, err.message);
      process.exit(1);
    }
  }
);

if (!config.env.isProduction()) {
  mongoose.set('debug', true);
}

// Load All Models
[
  'Resource'
].forEach(function(modelName) {
  require(path.join(__dirname, modelName));
  debug(`Model '${modelName}' loaded`);
  exports[modelName] = mongoose.model(modelName);
});
