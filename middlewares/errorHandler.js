'use strict';

const config = require('../config');
const respond = require('../common/respond');

module.exports = function errorHandlerMiddleware(ctx, next) {
  let error = ctx.error || { message: 'unknownError' };
  let message = `[${ new Date()}] ${ctx.ip} ${ctx.method} ${error.name || error.message} \n ${error.stack}`;
  let errorMessage = error.name || error.message;

  let mailText = `
    请求: ${message} \n
    参数: ${JSON.stringify(ctx.args)} \n
    错误名称: ${errorMessage} \n
    错误详情: ${error.stack} \n
  `;

  config.logger.error(mailText);

  respond(ctx, {
    status: -1,
    message: '系统错误',
    errors: {
      message: errorMessage,
      stack: config.env.isProduction() ? error.stack : ''
    }
  }, next);
};
