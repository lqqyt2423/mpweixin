'use strict';

const ovt = require('ovt');

module.exports = ovt.object().keys({
  page: ovt.number().default(1).gte(1).desc('第几页'),
  perPage: ovt.number().default(10).gt(0).lte(100).desc('每页几个')
});
