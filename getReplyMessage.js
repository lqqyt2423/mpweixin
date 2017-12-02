'use strict';

const reply = require('./reply');
const crypto = require('crypto');
const path = require('path');
const request = require('request');
const fs = require('fs');
const url = require('url');
const Resource = require('./models/Resource');
const shift = Array.prototype.shift;
const saveImgDir = '/root/resources';

module.exports = function(message) {
  return eachRules(message, saveSingleImg, saveImgFromJike, subscribe, theOther);
};

function eachRules() {
  let message = shift.call(arguments);
  for (let i = 0, len = arguments.length; i < len; i++) {
    let ruleFn = arguments[0];
    let replyContent = ruleFn(message);
    if (replyContent) {
      return reply(replyContent, message.ToUserName, message.FromUserName, message);
    }
  }
}

function saveSingleImg(message) {
  if (message.MsgType == 'image' && message.FromUserName == 'oc8_iw4nnQgE8mYbTJaTxRy_260E') {
    let PicUrl = message.PicUrl;
    let sha = crypto.createHash('sha1');
    sha.update(PicUrl);
    let filename = sha.digest('hex') + '.png';
    request(PicUrl).on('end', () => {
      let resource = new Resource({
        filename: filename,
        from: 'img-message'
      });
      resource.save();
    }).pipe(fs.createWriteStream(path.join(saveImgDir, filename)));
    return 'received single img message';
  }
}

function saveImgFromJike(message) {
  if (message.MsgType == 'text' && message.FromUserName == 'oc8_iw4nnQgE8mYbTJaTxRy_260E') {
    let Content = message.Content;
    if (Content.indexOf('m.okjike.com') > -1) {
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
            let sha = crypto.createHash('sha1');
            sha.update(PicUrl);
            let filename = sha.digest('hex') + '.' + extname;
            request(picUrl).on('end', () => {
              let resource = new Resource({
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
      return 'received img from jike';
    }
  }
}

function subscribe(message) {
  if (message.MsgType == 'event' && message.Event == 'subscribe') {
    return '欢迎关注\n有任何问题联系微信:\n18817507530';
  }
}

function theOther() {
  return '有任何问题联系微信:\n18817507530';
}