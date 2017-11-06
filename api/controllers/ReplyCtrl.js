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
    let validateSchema = {
      signature: ovt.string().desc('signature'),
      timestamp: ovt.string().desc('timestamp'),
      nonce: ovt.string().desc('nonce')
    };
    return {
      index: {
        description: 'validate',
        params: ovt.object(validateSchema).keys({
          echostr: ovt.string().desc('echostr')
        }).toObject(),
        route: { verb: 'get', path: '' }
      },
      reply: {
        description: 'reply',
        params: ovt.object(validateSchema).keys({
          openid: ovt.string().desc('openid')
        }).toObject(),
        route: { verb: 'post', path: '' }
      }
    };
  }

  _validate(args) {
    const token = 'weixin';
    if (!args.timestamp || !args.nonce || !args.signature) return false;
    let aQuery = [token, args.timestamp, args.nonce];
    aQuery.sort();
    let sQuery = sha1(aQuery.join(''));
    if (sQuery == args.signature) {
      return true;
    } else {
      return false;
    }
  }

	_textParser(req, cb) {
	  let body = [];
		req.on('data', chunk => {
	    body.push(chunk);
	  });
		req.on('end', () => {
			body = Buffer.concat(body).toString();
			cb(body);
		});
	}

  index(ctx, next) {
    const args = ctx.args;
    if (this._validate(args)) {
      ctx.res.send(args.echostr);
    } else {
      ctx.respond(new Error('not weixin'), next);
    }
  }

  reply(ctx, next) {
    const args = ctx.args;
    if (this._validate(args)) {
			this._textParser(ctx.req, text => {
				console.log(text);
			  ctx.respond({data: 'ok'}, next);
			});
    } else {
      ctx.respond(new Error('not weixin'), next);
    }
  }

};
