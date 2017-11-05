'use strict';

module.exports = {
  database: {
    mongodb: {
      db: 'mongodb://127.0.0.1/mpweixin',
      dbName: 'mpweixin',
      options: {
        server: {
          reconnectTries: Number.MAX_VALUE,
          poolSize: 50
        }
      }
    },
    redis: {
      port: 6379,
      host: '127.0.0.1',
      options: {}
    }
  },
  mongoose: {
    autoIndex: true
  },
  sessionSecret: 'WOUDsK1FarqNq38JnvcTFi7zsownTQvTpgrma77qidQ=',
  allowedOrigins: []
};