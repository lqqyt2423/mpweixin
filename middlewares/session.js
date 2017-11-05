'use strict';

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const config = require('../config');

// 处理 Session
module.exports = function makeSessionMiddleware(name) {
  return {
    middleware: session({
      name: `_mpweixin_session_${name}`,
      store: new RedisStore(config.database.redis),
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }
    }),
    config: { name: 'session', desc: 'Session 处理中间件' }
  };
};
