const express = require('express');
const router = express.Router();
const resourceSql = require('../db/sql/resource')
const db = require('../db/db');
const { log } = require('debug');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/main', function(req, res, next) {
  db.query(resourceSql.getResourceist(),[10]).then(result => {
    let context = {}
    context.url = 'dashboard'
    let saved_at = []
    let cpu = []
    let mem = []
    let disk = []
    for (let i=0; i < result.length; i++) {
      saved_at.push(result[i].saved_at)
      cpu.push(result[i].cpu)
      mem.push(result[i].memory)
      disk.push(result[i].disk)
    }
    context.data = {}
    context.data.saved_at = saved_at
    context.data.cpu = cpu
    context.data.mem = mem
    context.data.disk = disk
    res.render('main',context);
  })
  .catch(err => {
      console.log(err)  
      res.render('error');
  })
});

module.exports = router;
