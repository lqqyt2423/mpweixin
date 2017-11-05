'use strict';

const ApiBase = require('./ApiBase');
const ovt = require('ovt');
const Entity = require('baiji-entity');
const pagerSchema = require('../../schemas/pagerSchema');
const _ = require('lodash');
const sha1 = require('sha1');

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
          signature: ovt.string().desc('signature'),
          echostr: ovt.string().desc('echostr'),
          timestamp: ovt.string().desc('timestamp'),
          nonce: ovt.string().desc('nonce')
        }).toObject(),
        route: { verb: 'get', path: '' }
      }
    };
  }

  index(ctx, next) {
    const models = ctx.models;
    const args = ctx.args;
    const token = 'weixin';
    let aQuery = [token, args.timestamp, args.nonce];
    aQuery.sort();
    let sQuery = sha1(aQuery.join(''));
    if (sQuery == args.signature) {
      ctx.res.send(args.echostr);
    } else {
      ctx.respond(new Error('error'), next);
    }
  }

};
