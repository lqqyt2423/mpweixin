'use strict';

const xml2js = require('xml2js');

module.exports = function(body) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(body, {trim: true}, (err, result) => {
      if (err) reject(err);
      resolve(formatMessage(result.xml));
    });
  });
};

function formatMessage(result) {
  var message = {};
  if (typeof result === 'object') {
    for (var key in result) {
      if (!(result[key] instanceof Array) || result[key].length === 0) {
        continue;
      }
      if (result[key].length === 1) {
        var val = result[key][0];
        if (typeof val === 'object') {
          message[key] = formatMessage(val);
        } else {
          message[key] = (val || '').trim();
        }
      } else {
        message[key] = [];
        result[key].forEach(function (item) {
          message[key].push(formatMessage(item));
        });
      }
    }
    return message;
  } else {
    return result;
  }
};