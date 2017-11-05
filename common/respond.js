'use strict';

const _ = require('lodash');
const config = require('../config');

module.exports = function respond(ctx, data, next) {
  data = data || {};

  if (data instanceof Error) {
    data = { message: data.message, status: data.status || 2, errors: data };
  }

  data.status = data.status || 0;

  // 生成系统 metadata
  let metadata = _.extend({
    timestamp: new Date().toISOString(),
    endpoint: ctx.fullPath,
    method: ctx.method
  }, data.metadata || {});

  // http status code
  if (data.statusCode) {
    ctx.statusCode = data.statusCode;
  }

  if (Array.isArray(data.errors)) {
    data.errors = data.errors === undefined ? [] : [data.errors];
  }

  ctx.done({
    status: data.status,
    message: data.message || '数据获取成功',
    metadata: metadata,
    errors: config.env.isProduction() ? [] : data.errors,
    data: data.data || null
  });

  // Call next()
  if (typeof next === 'function') next();
};
