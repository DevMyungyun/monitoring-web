const express = require('express');
const router = express.Router();
const agentSql = require('../db/sql/agent')
const db = require('../db/db');
const { log } = require('debug');

const AgentSql = new agentSql()
const DB = new db()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/main', function(req, res, next) {
  DB.query(AgentSql.getAgentList(),[]).then(result => {
    let context = {}
    context.url = 'dashboard'
    let windows = []
    let linux = []
    let etc = []
    for (let i=0; i < result.length; i++) {
      if(result[i].os === "windows" || result[i].os ==="Windows") {
        windows.push(result[i].status)
      } else if (result[i].os === "linux" || result[i].os ==="Linux") {
        linux.push(result[i].status)
      } else {
        etc.push(result[i].status)
      }
    }

    context.data = {}
    context.data.windows = windows
    context.data.linux = linux
    context.data.etc = etc
    // console.log(context);
    res.render('main',context);
  })
  .catch(err => {
      console.log(err)  
      res.render('error');
  })
});

module.exports = router;
