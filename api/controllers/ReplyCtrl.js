'use strict';

const ApiBase = require('./ApiBase');
const ovt = require('ovt');
const Entity = require('baiji-entity');
const pagerSchema = require('../../schemas/pagerSchema');
const _ = require('lodash');
const sha1 = require('sha1');
const wechat = require('wechat');
const config = require('../../config');
const wechatConfig = config.wechatConfig;
const saveImgDir = config.saveImgDir;
const path = require('path');
const request = require('request');
const fs = require('fs');
const url = require('url');

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
    const models = ctx.models;
    const args = ctx.args;

    let replyArray = [];
    // self save img
    replyArray.push((message, res) => {
      if (message.MsgType == 'image' && message.FromUserName == 'oc8_iw4nnQgE8mYbTJaTxRy_260E') {
        let PicUrl = message.PicUrl;
        let filename = sha1(PicUrl) + '.png';
        request(PicUrl).on('end', () => {
          res.reply('received single img message');
          let resource = new models.Resource({
            filename: filename,
            from: 'img-message'
          });
          resource.save();
        }).pipe(fs.createWriteStream(path.join(saveImgDir, filename)));
        return true;
      }
    });
    // save img from jike
    replyArray.push((message, res) => {
      if (message.MsgType == 'text' && message.FromUserName == 'oc8_iw4nnQgE8mYbTJaTxRy_260E') {
        let Content = message.Content;
        if (Content.indexOf('m.okjike.com') > -1) {
          res.reply('received img from jike');
          let pathname = url.parse(Content).pathname;
          let jikeMessageId = pathname.replace('/messages/', '');
          let jikeApiUrl = `https://app.jike.ruguoapp.com/1.0/messages/getForSharePage?id=${jikeMessageId}`;
          request.get({
            url: jikeApiUrl,
            json: true
          }, (err, response, body) => {
            if (err) return console.log(err);
            let pictureUrls = body.pictureUrls;
            let name = `${body.title}-${body.content}`;
            if (pictureUrls && pictureUrls.length) {
              pictureUrls.forEach(item => {
                let extname = item.format || 'png';
                let picUrl = item.picUrl;
                let filename = sha1(picUrl) + '.' + extname;
                request(picUrl).on('end', () => {
                  let resource = new models.Resource({
                    filename: filename,
                    from: 'jike',
                    width: item.width || 0,
                    htight: item.height || 0,
                    name: name
                  });
                  resource.save();
                }).pipe(fs.createWriteStream(path.join(saveImgDir, filename)));
              });
            }
          });
          return true;
        }
      }
    });
    // 关注
    replyArray.push((message, res) => {
      if (message.MsgType == 'event' && message.Event == 'subscribe') {
        res.reply('欢迎关注\n有任何问题联系微信:\n18817507530');
        return true;
      }
    });
    replyArray.push((message, res) => {
      res.reply('有任何问题联系微信:\n18817507530');
      return true;
    });
    if (this._validate(args)) {
      wechat(wechatConfig, (req, res, next) => {
        let message = req.weixin;
        // 迭代器
        for (let i=0, len=replyArray.length; i<len; i++) {
          let fn = replyArray[i];
          if (fn(message, res)) break;
        }
      })(ctx.req, ctx.res, next);
    } else {
      ctx.respond(new Error('not weixin'), next);
    }
  }

};
