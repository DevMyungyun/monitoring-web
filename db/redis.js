const redis = require('redis');
const conf = require('../config')

var redisClient = redis.createClient(conf.redisPort, conf.redisHost);

redisClient.auth(conf.redisPass, function (err) {
    if (err) throw err;
});

redisClient.on('error', function(err) {
    console.log('Redis error: ' + err);
});

module.exports = redisClient;
