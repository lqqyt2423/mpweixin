'use strict';

const http = require('http');
const url = require('url');
const crypto = require('crypto');
const parseWeixin = require('./parseWeixin');
const reply = require('./reply');

const server = http.createServer(handle);

server.listen(8002, () => {
  console.log('server listening on 8002');
});

async function handle(req, res) {
  let time = Date.now();
  let link = url.parse(req.url, true);
  let pathname = link.pathname;
  let args = link.query;
  let method = req.method;
  // /weixin/api
  if (pathname == '/weixin/api/reply' && method == 'GET') {
    if (_validate(args)) {
      res.write(args.echostr);
    } else {
      res.statusCode = 404;
    }
  }
  if (pathname == '/weixin/api/reply' && method == 'POST') {
    if (!_validate(args)) {
      res.statusCode = 404;
    } else {
      let body = await loadReqBody(req);
      body = body.toString();
      let message = await parseWeiin(body);
      res.write(reply('ok hello', message.ToUserName, message.FromUserName, message));
    }
  }
  res.end();
  console.log(`${method} ${pathname} ${res.statusCode} ${Date.now() - time} ms`);
}

function _validate(args) {
  const token = 'weixin';
  if (!args.timestamp || !args.nonce || !args.signature) return false;
  let aQuery = [token, args.timestamp, args.nonce];
  aQuery.sort();
  let shasum = crypto.createHash('sha1');
  shasum.update(aQuery.join(''));
  return shasum.digest('hex') === args.signature;
}

function loadReqBody(req) {
  return new Promise(resolve => {
    let buffers = [];
    req.on('data', chunk => {
      buffers.push(chunk);
    });
    req.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
}