'use strict';

const debug = require('debug')('mpweixin:middlewares:init');
const respond = require('../common/respond');
const readOnly = require('../common/readOnly');

// 挂在 model 到 ctx
const models = require('../models');

module.exports = function mountModel(ctx, next) {
  // Debug 日志
  debug('\n');
  debug('============    接口方法名      ============');
  debug('%s  %s', ctx._method.fullName(), ctx._method.description);

  debug('============    接口请求地址    ============');
  debug('%s  %s', ctx.method, ctx.url);

  debug('============     接口参数      ============');
  debug('%j', ctx.args);

  readOnly(ctx, 'models', models);
  readOnly(ctx, 'respond', function(data, next) {
    respond(this, data, next);
  });

  next();
};
