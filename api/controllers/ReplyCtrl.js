'use strict';

const ApiBase = require('./ApiBase');
const ovt = require('ovt');
const Entity = require('baiji-entity');
const pagerSchema = require('../../schemas/pagerSchema');
const _ = require('lodash');

module.exports = class ReplyCtrl extends ApiBase {
  constructor() {
    super();
    this.description = 'reply';
  }

  initConfig() {
    return {
      index: {
        description: 'reply',
        params: ovt.object().keys({
        }).toObject(),
        route: { verb: 'get', path: '' }
      }
    };
  }

  index(ctx, next) {
    const models = ctx.models;
    const args = ctx.args;
    ctx.respond({ data: 'ok' }, next);
  }

};
