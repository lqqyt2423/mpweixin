'use strict';

const redis = require('redis');
const debug = require('debug')('mpweixin:common:redis');
const config = require('../config');
const redisConfig = config.database.redis;

var redisClient = redis.createClient(redisConfig.port, redisConfig.host, redisConfig.options);

module.exports = redisClient;
module.exports.writeCache = writeCache;
module.exports.deleteCache = deleteCache;
module.exports.readCache = readCache;
module.exports.fetch = fetch;
module.exports.debug = debug;

function promisify(exec, callback) {
  if (typeof callback === 'function') {
    exec(callback);
  } else {
    return new Promise(function(resolve, reject) {
      exec(function(err, value) {
        if (err) return reject(err);
        resolve(value);
      });
    });
  }
}

/**
 * 写入缓存
 * 用 JSON.stringify 转换后写入缓存
 * @param {String} key 缓存使用的 cacheKey
 * @param {Object} value 需要被缓存的值, 将会被转换为 JSON string
 * @param {Number|Function} expiresIn 过期时间或者回调函数
 * @param {Function} callback 回调函数
 **/
function writeCache(key, value, expiresIn, callback) {
  value = JSON.stringify(value);
  var cache = redisClient.multi().set(key, value);
  if (typeof expiresIn === 'function') {
    callback = expiresIn;
    expiresIn = 0;
  }
  if (expiresIn && expiresIn > 0) cache.expire(key, expiresIn);
  debug(`Cache write for '${key}'`);
  return promisify(cache.exec.bind(cache), callback);
}

/**
 * 过期缓存
 * @param {String} key 缓存使用的 cacheKey
 * @param {Function} callback 回调函数
 **/
function deleteCache(key, callback) {
  var cache = redisClient.multi().del(key);
  debug(`Cache delete for '${key}'`);
  return promisify(cache.exec.bind(cache), callback);
}

/**
 * 读取缓存
 * 读取缓存, 并用 JSON.parse 转换
 * @param {String} key 缓存使用的 cacheKey
 * @param {Function} callback 回调函数
 **/
function readCache(key, callback) {
  return promisify(function(cb) {
    redisClient.get(key, function(err, value) {
      if (err) return cb(err);
      try {
        value = value && JSON.parse(value);
        debug(`Cache hit for '${key}'`);
      } catch(e) {
        value = null;
        return cb(e);
      }
      cb(null, value);
    });
  }, callback);
}

/**
 * 获取缓存
 * 获取缓存, 未命中缓存时, 自动读取最新数据, 并缓存
 * @param {String} key 缓存使用的 cacheKey
 * @param {Function} cacheFn 重新缓存函数
 * @param {Function} callback 回调函数
 **/
function fetch(key, cacheFn, callback) {
  let execCacheFn = function(data) {
    if (typeof cacheFn === 'function') {
      return Promise.resolve(cacheFn()).then(function(result) {
        return writeCache(key, result);
      });
    } else {
      return Promise.resolve(data);
    }
  };

  // 获取缓存
  return readCache(key).then(function(data) {
    if (data) {
      if (Array.isArray(data)) {
        return data.length ? data : execCacheFn(data);
      } else {
        return data;
      }
    } else {
      return execCacheFn(data);
    }
  }).then((data) => {
    return typeof callback === 'function' ? callback(null, data) : data;
  }).catch((err) => {
    if (typeof callback === 'function') callback(err);
  });
}
