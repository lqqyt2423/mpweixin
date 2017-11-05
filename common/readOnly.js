'use strict';

module.exports = function readOnly(obj, property, value) {
  Object.defineProperty(obj, property, {
    get: function() {
      return value;
    },
    configurable: false
  });
};
