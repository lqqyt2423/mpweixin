'use strict';

const respond = require('../common/respond');

module.exports = require('ovt-plugin-baiji').middleware(function(ctx, next) {
  if (ctx.ovtErrors) {
    respond(ctx, {
      status: 2,
      message: ctx.ovtErrors.join('') || '信息输入有误, 请检查您的输入',
      errors: ctx.ovtErrors
    });
  } else {
    next();
  }
}, { abortEarly: true });
