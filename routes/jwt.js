const express = require('express');
const router = express.Router();
const axios = require('axios');
const os = require('os');
const db = require('../db/db')
const agentSql = require('../db/sql/agent')
const jwt = require('../auth/jwt')
const crypto = require('crypto');
const {
  token
} = require('morgan');

const AgentSql = new agentSql()
const DB = new db()

router.get('/main', function (req, res, next) {
  res.render("auth/jwt");
});

router.post("/generate", function (req, res, next) {
  let body = req.body;
  let params = [body.name]
  DB.query(AgentSql.getSingleAgent(), params).then(rows => {
    console.log('rows', rows);
    let uuid = rows[0].id.toString()
    console.log('uuid', uuid);
    let hashSecret = crypto.createHash("sha512").update(uuid).digest("hex");
    console.log('hash secret', hashSecret);
    try {
      const token = jwt.generateToken("HS512", rows[0].name, uuid, hashSecret)
      console.log('jwt token', token);
      res.json({
        "token": token
      });
    } catch (e) {
      console.log('Error during generating JWT', e)
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
  DB.query(AgentSql.getSingleUser(), params).then(rows => {
    let uuid = rows[0].id.toString()
    let hashSecret = crypto.createHash("sha512").update(uuid).digest("hex");
    console.log('hash secret', hashSecret);
    try {
      let result = jwt.veryfyToekn(clientToken[1], hashSecret)
      console.log('verify token', result);
      (result !== null && result !== false) ? res.status(201).json({
        success: 'authorized'
      }): res.status(401).json({
        error: 'unauthorized'
      })
    } catch (e) {
      console.log('JWT Verify error', e);
    }
  })
})

router.post("/refresh/token", function (req, res, next) {
  // let body = req.body;
  var networkInterfaces = os.networkInterfaces();
  DB.query(AgentSql.getSingleAgent(), [req.query.name]).then(rows => {
    console.log('rows', rows);
    let uuid = rows[0].id.toString()
    console.log('uuid', uuid);
    let hashSecret = crypto.createHash("sha512").update(uuid).digest("hex");
    console.log('hash secret', hashSecret);
    try {
      const token = jwt.generateToken("HS512", rows[0].name, uuid, hashSecret)
      console.log('jwt token', token);
      DB.query(AgentSql.updatetAgentJwt(uuid), [token]).then(refreshTokenResult => {
        console.log('after refresh token ', refreshTokenResult)
        let body = {}
        body.ID = rows[0].id.toString()
        body.NAME = rows[0].name
        body.JWT = token
        body.MAIN_SERVER_ADDRESS = 'http://' + networkInterfaces["Wi-Fi"][1].address + ':' + conifg.webport
        axios.defaults.headers.post = null
        axios.post(rows[0].address + '/handshake', body).then(response => {
          res.status(200).json({
            success: "successfully refresh JWT"
          });
          console.log('response from ' + rows[0].name + ' agent', response.data)
        }).catch(err => {
          console.log(err)
          res.json({
            "code": '500',
            "status": "Server Error",
            "description": "Fail to handshake"
          });
        })
      }).catch(err => {
        console.log(err)
        res.json({
          "code": '500',
          "status": "Server Error",
          "description": "Unexpected error"
        })
      })
    } catch (e) {
      console.log('Error during generating JWT', e)
      res.status(500).json({
        status: "Server Error"
      });
    }
  })
})

module.exports = router;