'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const baiji = require('baiji');
const glue = require('baiji-glue');
const session = require('../middlewares/session')('api');
const config = require('../config');


const api = baiji('api', { mountPath: 'api' });

// 载入所有控制器
const ctrls = glue.load(path.join(__dirname, 'controllers'), '*Ctrl.js');
_.values(ctrls).map(ctrl => api.use(ctrl));

// 处理 Session
api.use(session.middleware, session.config);

// 接口文档
if (config.env.isDevelopment()) {
  api.plugin(require('baiji-swagger'), {
    swagger: {
      host: 'localhost:8002',
      basePath: '/',
      info: {
        title: 'mpweixin 接口文档',
        version: 'v1',
        description: fs.readFileSync(path.join(__dirname, '../API_DOC.md'), 'utf-8'),
      },
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      }
    }
  });
}

module.exports = api;
