const cassandra = require('cassandra-driver'); 
const conf = require('../config.js');

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

function db () {}

db.prototype.query = async function (query, params) {
  try {
    const result = await client.execute(query, params, { prepare: true, isIdempotent: true });
    // console.log('result db', result.rows);
    // client.shutdown();
    return result.rows
  }catch (e) {
    console.log('error occur',e);
    return e
  }
}

// Promise Query
// db.query = (query, params, callback) => {
//     return new Promise((resolve, reject) => {
//       client.execute(query, params, (err, result) => {
//         if(err) {
//           reject()
//         } else {
//           const start = Date.now();
//           const curDate = Date(start);
//           const duration = Date.now() - start;
//           // console.log('>>> '+ curDate +' excuted query', { query, duration, result: result.rows });
//           callback(err, result.rows);
//           resolve(result.rows)
//         }
//         client.shutdown();
//       });
//     }).catch((err) => {
//       console.log('Promise error',err);
//       // done();
//     });
// }

db.prototype.resultMsg = function (vdata) {
	var vresult = {};
	// vresult['code'] = vcode;
	vresult['statusMsg'] = errorMsg[vcode];
	vresult['data'] = vdata;
	return vresult;
};

module.exports = db;
