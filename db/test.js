const assert = require('assert');
const cassandra = require('cassandra-driver'); 
const conf = require('../config.js')
const db = require('./db.js')
const sql = require('./sql/user.js')

const config = {
	host: conf.contactPoints,
	localDataCenter: conf.localDataCenter,
	username: conf.username,
	password: conf.password,
	keyspace: conf.keyspace,
	port: conf.dbport
};
 
const client = new cassandra.Client({
  contactPoints: config.host,
  protocolOptions: { port: config.port },
  localDataCenter: config.localDataCenter,
  keyspace: config.keyspace,
  credentials: { username: config.username, password: config.password },
  pooling: {
    coreConnectionsPerHost: {
	  maxRequestsPerConnection: 500
    } 
  },
  socketOptions:
   {
	  connectTimeout: 2000,
	  readTimeout: 10000,
   }
});


db.query(sql.getUserList(), []).then(result => {
  console.log('result list',result);
})

// db.query(sql.getUserList(), [], (err,result) => {
//   if (err) {
//     console.log('error',err);
//   }
//   // console.log('result',result);
// })

// function execute(query, params, callback) {
//   return new Promise((resolve, reject) => {
//     client.execute(query, params, (err, result) => {
//       if(err) {
//         reject()
//       } else {
//         callback(err, result);
//         resolve()
//       }
//     });
//   });
// }
 
// var query = 'SELECT name, price_p_item FROM grocery.fruit_stock WHERE name=? ALLOW FILTERING';
// var q1 = execute(query, ['oranges'], (err, result) => { 
// 	assert.ifError(err); 
// 	console.log('The cost per orange is $' + result.rows[0].price_p_item)});
// var q2 = execute(query, ['pineapples'], (err,result) => { 
// 	assert.ifError(err); 
// 	console.log('The cost per pineapple is $' + result.rows[0].price_p_item)});
// var q3 = execute(query, ['apples'], (err,result) => { 
// 	assert.ifError(err); 
// 	console.log('The cost per apple is $' + result.rows[0].price_p_item)});
// Promise.all([q1,q2,q3]).then(() => {
//   console.log('exit');
//   process.exit();
// });


// module.exports = test;
