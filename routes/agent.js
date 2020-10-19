const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db/db')
const agentSql = require('../db/sql/agent')
const resourceSql = require('../db/sql/resource')
const jwt = require('../auth/jwt')
const crypto = require('crypto');
const cassandra = require('cassandra-driver');
const { token } = require('morgan');
const { param } = require('.');
const Uuid = cassandra.types.Uuid;

router.get('/main', function(req, res, next) {
    db.query(agentSql.getAgentist(),[]).then(result => {
        console.log("list###", result);
        let data = {}
        data.url= 'agent-main'
        data.rows=result
        res.render('main',data);
    })
    .catch(err => {
        console.log(err)
        res.render('error',{message:"agent main error", error:{status:"Error while page is loaded"}});
    })
});

router.get('/register', function(req, res, next) {
res.render('main',{url : 'agent-register'});
});

router.get('/', function(req, res, next) {
    let params = req.query
    db.query(agentSql.getSingleAgent(),[params.name]).then(result => {
        console.log("list###", result);
        let context = {}
        context.url= 'agent-detail'
        context.rows= {}
        context.rows.name= result[0].name
        context.rows.description=result[0].description
        context.rows.os=result[0].os
        context.rows.version=result[0].version
        context.rows.create_at=result[0].create_at
        context.rows.update_at=result[0].update_at
         
        let dataLength = (params.length) ? params.length : 10
        db.query(resourceSql.getSingleResource(),[result[0].id.toString(),dataLength]).then(result2 => {
            let saved_at = []
            let cpu = []
            let mem = []
            let disk = []
            for (let i=0; i < result2.length; i++) {
            saved_at.push(result2[i].saved_at)
            cpu.push(result2[i].cpu)
            mem.push(result2[i].memory)
            disk.push(result2[i].disk)
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
            res.render('error',{message:"agent main error", error:{status:"Error while page is loaded"}});
        })
    })
    .catch(err => {
        console.log(err)
        res.render('error',{message:"agent main error", error:{status:"Error while page is loaded"}});
    })
});
router.post('/', function(req, res, next) {
    const body = req.body
    const uuid = Uuid.random();
    let hashSecret = crypto.createHash("sha512").update(uuid.toString()).digest("hex");
    console.log('hash secret', hashSecret);
    try {
        const token = jwt.generateToken("HS512", body.name, uuid.toString(), hashSecret)
        let params = [uuid.toString(), body.name, body.description, body.os, body.version, token]
        db.query(agentSql.insertAgent(),params).then(result => {
            console.log(result);
            res.redirect("/agent/main");
        })
        .catch(err => {
            console.log(err)  
        })
    }catch (e) {
        res.redirect("/agent/register");
    } 
});

router.put('/', function(req, res, next) {
    let body = req.body
    console.log(req.body);
    try {
        db.query(agentSql.updatetAgent(),params).then(result => {
            console.log(result);
            let params = [body.name, body.description, body.os, body.version]
            db.query(agentSql.updatetAgent(result[0].uuid.toString()),params).then(result2 => {
                console.log(result2);
                res.redirect("/agent/main");
            })
            .catch(err => {
                console.log(err)  
            })
        })
        .catch(err => {
            console.log(err)  
        })
    }catch (e) {
        res.redirect("/agent/register");
    } 
});

router.delete('/', function(req, res, next) {
    console.log(req.query);
    res.redirect("/agent/main");
});

router.post('/cron/start', function(req, res, next) {
    console.log(req.body);
    const agentUrl = req.body.url
    let reqBody = {}
    axios.post(agentUrl, {
        title,
        completed
      })
      .then(res => this.todos = [...this.todos, res.data])
      .catch(err => console.log(err))
    res.json({"code":'200', "status":"success"});
});


router.post('/v1/windows/resource/receive', function(req, res, next) {
  console.log("########request#####",req.headers);
  console.log("########request#####",req.query);
  console.log("########request#####",req.body);
  let body = req.body
  let resourceData = calculateResource(body, "windows")
  let token = req.headers.authorization.split(" ")
  token = token[1]
  db.query(agentSql.getSingleAgent(),[req.query.name]).then(result => {
    let hashSecret = crypto.createHash("sha512").update(result[0].id.toString()).digest("hex");
    let tokenCheck = jwt.veryfyToekn(token,hashSecret)
    console.log(tokenCheck);
    // insert resource data in DB
    const uuid = Uuid.random();
    db.query(resourceSql.insertResource(),[uuid,result[0].id, resourceData.cpu, resourceData.mem, resourceData.disk]).then(result2 => {
        console.log(result2);
    })
    .catch(err => {
        console.log(err)  
    })
  })
  .catch(err => {
      console.log(err)  
  })
  res.json({"code":'200', "status":"success"});
});

router.post('/v1/linux/resource/receive', function(req, res, next) {
    let body = req.body
    let resourceData = calculateResource(body, "linux")
    let token = req.headers.authorization.split(" ")
    token = token[1]
    db.query(agentSql.getSingleAgent(),[req.query.name]).then(result => {
      let hashSecret = crypto.createHash("sha512").update(result[0].id.toString()).digest("hex");
      let tokenCheck = jwt.veryfyToekn(token,hashSecret)
      console.log(tokenCheck);
      // insert resource data in DB
      const uuid = Uuid.random();
      db.query(resourceSql.insertResource(),[uuid,result[0].id, resourceData.cpu, resourceData.mem, resourceData.disk]).then(result2 => {
          console.log(result2);
      })
      .catch(err => {
          console.log(err)  
      })
    })
    .catch(err => {
        console.log(err)  
    })
    res.json({"code":'200', "status":"success"});
});


function calculateResource (data, os) {
    let cpu = ""
    let mem = ""
    let disk = ""
    let result = {}
    if(os === "windows") {
        cpu = data.cpu[0].Average
        mem = Math.round(100 * (Number(data.mem[0].FreePhysicalMemory)/Number(data.mem[0].TotalPhysicalMemory)))
        disk = Math.round(100 * (Number(data.disk[0].FreeSpace)/Number(data.disk[0].Size)))

        result.cpu = cpu
        result.mem = mem.toString()
        result.disk = disk.toString()
        return result 
    } else if (os ==="linux") {
        cpu = data.cpu[0].replace(/\n/g,'');
        mem = Math.round(100 * ((Number(data.mem.total)-Number(data.mem.free)-Number(data.mem["buff/cache"]))/Number(data.mem.total)))
        //let rootDisk = data.disk.filter(it => new RegExp('root', "i").test(it.Mounted))
        //console.log('####root',rootDisk);
        disk = Math.round(100 * (Number(data.disk[4].Used)/Number(data.disk[4]['1K-blocks'])))
        result.cpu = cpu
        result.mem = mem.toString()
        result.disk = disk.toString()
        return result
    } 
    
}
module.exports = router;
