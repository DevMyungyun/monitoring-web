const express = require('express');
const router = express.Router();
const db = require('../db/db')
const sql = require('../db/sql/user')
const jwt = require('../auth/jwt')
const crypto = require('crypto')

router.get('/main', function (req, res, next) {
  res.render("auth/jwt");
});

router.post("/generate", function (req, res, next) {
  let body = req.body;
  sess = req.session;
  let params = [sess.email]
  console.log(sess);
  console.log(sess.email);
  console.log('####', typeof sess.email);
  db.query(sql.getSingleAgent(), params).then(rows => {
    let uuid = rows[0].id.toString()
    console.log('rows', rows);
    console.log('uuid', uuid);
    let hashSecret = crypto.createHash("sha512").update(uuid).digest("hex");
    console.log('hash secret', hashSecret);
    try {
      token = jwt.generateToken("HS512", rows[0].name, uuid, hashSecret)
      console.log('jwt token', token);
      res.json(token);
    } catch (e) {
      console.log('JWT generation error',e)
    }
  })
})


router.get('/verify', (req, res, next) => {
  let clientToken = req.headers.authorization;
  clientToken = clientToken.split(' ')
  console.log(typeof clientToken);
  console.log(clientToken[1]);
  let query = req.query
  let params = [query.email]
  // let body = req.body;
  // sess = req.session;
  // let params = [sess.email]
  db.query(sql.getSingleUser(), params).then(rows => {
    let uuid = rows[0].id.toString()
    let hashSecret = crypto.createHash("sha512").update(uuid).digest("hex");
    console.log('hash secret', hashSecret);
    try {
      let result = jwt.veryfyToekn(clientToken[1], hashSecret)
      console.log('verify token',result);
      (result !== null && result !== false ) ? res.status(201).json({success: 'authorized'}) : res.status(401).json({error: 'unauthorized'})
    } catch (e) {
      console.log('JWT Verify error',e);
    }
  })
})

module.exports = router;

// let jwtToken = ''
// db.query(sql.getSingleUser(), ["test04@test.com"], (err,rows) => {
//   if (err) {
//     res.json(db.resultMsg(err))
//   }
//   let uuid = rows[0].id.toString()
//   console.log('rows',rows);
//   console.log('uuid',uuid);
//   let hashSecret = crypto.createHash("sha512").update(uuid).digest("hex");
//   console.log('hash secret', hashSecret);
//   jwtToken = jwt.generateToken("HS512", rows[0].email, 1485270000000, uuid, rows[0].name, hashSecret)
//   console.log('jwt token', jwtToken);
// })
// console.log('jwt token', jwtToken);