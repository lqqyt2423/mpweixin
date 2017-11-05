'use strict';

const baiji = require('baiji');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const _ = require('lodash');

const config = require('./config');

let app = baiji('mpweixin', { mountPath: '/weixin' });

// 开发环境下, 使用 Evaluator 插件
if (config.env.isDevelopment()) app.plugin('evaluator');

// 允许 string 分割为数组
app.set('adapterOptions', {
  arrayItemDelimiters: [',', ' ', '，', '、', '/'],
  json: { strict: false, limit: '2mb' }
});

app.enable('trust proxy');

// 记录响应时间
app.use(require('response-time')(), { name: 'response-time', desc: '响应时间中间件' });

// 记录访问日志
var loggerFormat = ':remote-addr - :remote-user [:date[clf]] ' +
                   '":method :url HTTP/:http-version" ' +
                   ':status :res[content-length] ":referrer" ":user-agent" ' +
                   '" - :response-time ms"';
app.use(morgan(loggerFormat, { stream: config.logger.access }), { name: 'morgan', desc: '日志记录中间件' });

// 解析 Cookie
app.use(cookieParser(), { name: 'cookieParser', desc: 'Cookie 解析中间件' });

// 添加 CORS 支持, 并维护一个白名单
const CORS_WHITELIST = config.allowedOrigins;
app.set('adapterOptions.cors', {
  credentials: true,
  origin: function(origin, callback){
    // 当 WHITELIST 不为空, 且 origin 在白名单中则允许
    // 当 WHITELIST 为空, 则不限制 origin
    let originIsWhitelisted = _.isEmpty(CORS_WHITELIST) || CORS_WHITELIST.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
});

// 载入 前端接口 服务
app.use(require('./api'));

// 处理 404
app.define('404', {
  description: '处理所有未知链接',
  http: { verb: 'all', path: '*' }
}, function(ctx, next) {
  let message = `There is no method to handle ${ctx.method} ${ctx.url}`;
  ctx.done({
    status: -1,
    message,
    metadata: {},
    errors: [{
      name: 404,
      message
    }]
  }, next);
});

module.exports = app;
