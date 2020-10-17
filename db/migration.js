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

// var q1 = execute(generateKeyspace, [], (err, result) => { 
// 	assert.ifError(err); 
//     console.log('result query 1 : ' + result)
// });
// var q2 = execute(createUserTable, [], (err, result) => { 
// 	assert.ifError(err); 
//     console.log('result query 2 : ' + result)
// });
q2 = db.query(createUserTable)

Promise.all([q2]).then(() => {
    console.log('exit');
    process.exit();
});

