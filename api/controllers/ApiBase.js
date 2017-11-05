'use strict';

const baiji = require('baiji');

module.exports = class ApiBase extends baiji.Controller {
  constructor() {
    super();

    // 初始化中间件
    this.beforeAction(require('../../middlewares/init'));

    // Ovt 中间件
    this.beforeAction(require('../../middlewares/ovt'));

    // 错误处理
    this.afterErrorAction(require('../../middlewares/errorHandler'));
  }
};
