const db = require('./db.js')

  let generateKeyspace = "CREATE KEYSPACE IF NOT EXISTS monitoring";
  generateKeyspace += "WITH REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor': 3}"
  
  let createUserTable = "CREATE TABLE IF NOT EXISTS monitoring.users ("
  createUserTable += "id UUID PRIMARY KEY, "
  createUserTable += " name text, "
  createUserTable += " email text, "
  createUserTable += " password text, "
  createUserTable += " create_at timestamp,  "
  createUserTable += " update_at timestamp "
  createUserTable += " ) "

  let createAgentTable = "CREATE TABLE monitoring.agent ( "
  createAgentTable +=  "id uuid PRIMARY KEY, "
  createAgentTable += "name text, "
  createAgentTable += "description text, "
  createAgentTable += "os text, "
	createAgentTable += "version text, "
	createAgentTable += "jwt text, "
	createAgentTable += "status text, "
	createAgentTable += "create_at timestamp, "
  createAgentTable += "update_at timestamp "
  createAgentTable += ") "


  let createResourceTable = "CREATE TABLE monitoring.resource ( "
  createResourceTable += "id uuid, "
  createResourceTable += "aid uuid, "
  createResourceTable += "cpu text, "
  createResourceTable += "memory text, "
  createResourceTable += "disk text, "
  createResourceTable += "saved_at timestamp, "
  createResourceTable += "PRIMARY KEY ( aid, saved_at) "
  createResourceTable += ") " 

// var q1 = execute(generateKeyspace, [], (err, result) => { 
// 	assert.ifError(err); 
//     console.log('result query 1 : ' + result)
// });
// var q2 = execute(createUserTable, [], (err, result) => { 
// 	assert.ifError(err); 
//     console.log('result query 2 : ' + result)
// });
q1 = db.query(createUserTable)
q2 = db.query(createAgentTable)
q3 = db.query(createResourceTable)

Promise.all([q1,q2,q3]).then(() => {
    console.log('exit');
    process.exit();
});

