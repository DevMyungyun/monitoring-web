const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db/db')
const agentSql = require('../db/sql/agent')
const resourceSql = require('../db/sql/resource')
const jwt = require('../auth/jwt')
const crypto = require('crypto');
const os = require('os');
const conifg = require('../config')
const cassandra = require('cassandra-driver');
const Uuid = cassandra.types.Uuid;

const AgentSql = new agentSql()
const ResourceSql = new resourceSql()
const DB = new db()

router.get('/main', function (req, res, next) {
  DB.query(AgentSql.getAgentList(), []).then(result => {
      let data = {}
      data.url = 'agent-main'
      result.forEach(el => {
        el.create_at = getDateFormat(el.create_at)
        if (el.update_at) {
          el.update_at = getDateFormat(el.update_at)
        }
      });
      // console.log("list###", result);                   
      data.rows = result
      res.render('main', data);
    })
    .catch(err => {
      console.log(err)
      res.render('error', {
        message: "agent main error",
        error: {
          status: "Error while page is loaded"
        }
      });
    })
});

router.get('/register', function (req, res, next) {
  res.render('main', {
    url: 'agent-register'
  });
});

router.get('/', function (req, res, next) {
  let params = req.query
  DB.query(AgentSql.getSingleAgent(), [params.name]).then(result => {
      // console.log("list###", result);
      let context = {}
      context.url = 'agent-detail'
      context.rows = {}
      context.rows.name = result[0].name
      context.rows.description = result[0].description
      context.rows.os = result[0].os
      context.rows.version = result[0].version
      context.rows.status = result[0].status
      context.rows.address = result[0].address
      context.rows.create_at = getDateFormat(result[0].create_at)
      context.rows.update_at = getDateFormat(result[0].update_at)
      let dataLength = (params.length) ? params.length : 10
      DB.query(ResourceSql.getSingleResource(), [result[0].id.toString(), dataLength]).then(result2 => {
          let saved_at = []
          let cpu = []
          let mem = []
          let disk = []
          for (let i = 0; i < result2.length; i++) {
            saved_at.push(getDateFormat(result2[i].saved_at))
            cpu.push(result2[i].cpu)
            mem.push(result2[i].memory)
            disk.push(result2[i].disk)
          }
          context.data = {}
          context.data.saved_at = saved_at
          context.data.cpu = cpu
          context.data.mem = mem
          context.data.disk = disk
          res.render('main', context);
        })
        .catch(err => {
          console.log(err)
          res.render('error', {
            message: "agent main error",
            error: {
              status: "Error while page is loaded"
            }
          });
        })
    })
    .catch(err => {
      console.log(err)
      res.render('error', {
        message: "agent main error",
        error: {
          status: "Error while page is loaded"
        }
      });
    })
});

router.post('/', function (req, res, next) {
  const body = req.body
  const uuid = Uuid.random();
  let hashSecret = crypto.createHash("sha512").update(uuid.toString()).digest("hex");
  console.log('hash secret', hashSecret);
  try {
    const token = jwt.generateToken("HS512", body.name, uuid.toString(), hashSecret)
    let params = [uuid.toString(), body.name, body.description, body.os, body.version, "beforeHandshake", body.address, token]
    DB.query(AgentSql.insertAgent(), params).then(result => {
        console.log(result);
        res.redirect("/agent/main");
      })
      .catch(err => {
        console.log(err)
      })
  } catch (e) {
    res.redirect("/agent/register");
  }
});

router.put('/', function (req, res, next) {
  let body = req.body
  console.log(">>>>>", req.body);
  try {
    DB.query(AgentSql.getSingleAgent(), [req.query.name]).then(result => {
        console.log(result);
        let params = [body.description, body.os, body.version, body.address]
        DB.query(AgentSql.updatetAgent(result[0].id.toString()), params).then(result2 => {
            res.json({
              "code": '200',
              "status": "success",
              "description": "Successfully update"
            });
          }).catch(err => {
            console.log(err)
            res.json({
              "code": '500',
              "status": "Server Error",
              "description": "Fail to update"
            });
          })
      }).catch(err => {
        console.log(err)
      })
  } catch (e) {
    res.redirect("/agent/register");
  }
});

router.delete('/', function (req, res, next) {
  console.log(req.query);
  DB.query(AgentSql.getSingleAgent(), [req.query.name]).then(result => {
      DB.query(AgentSql.deleteAgent(), [result[0].id.toString()]).then(result2 => {
          res.json({
            "code": '200',
            "status": "success",
            "description": "Successfully delete"
          });
        }).catch(err => {
          console.log(err)
          res.json({
            "code": '500',
            "status": "Server Error",
            "description": "Fail to delete"
          });
        })
    }).catch(err => {
      console.log(err)
      res.json({
        "code": '500',
        "status": "Server Error",
        "description": "Unexpected error"
      });
    })

});

router.get('/healthcheck', function (req, res, next) {
  DB.query(AgentSql.getSingleAgent(), [req.query.name]).then(result => {

      axios.defaults.headers.post = null
      axios.get(result[0].address + '/v1/health', null, null)
        .then(response => {
          console.log('response from ' + result[0].name + ' agent', response.data)
          res.json({
            "code": '200',
            "status": "Success",
            "description": "Successfully health check"
          });
        }).catch(err => {
          console.log(err)
          if (result[0].status !== 'beforeHandshake') {
            DB.query(AgentSql.updatetAgentStatus(result[0].id.toString()), ['stop'])
              .then(result => {
                res.json({
                  "code": '500',
                  "status": "Server Error",
                  "description": "Fail to health check"
                });
              })
              .catch(err => {
                console.log(err)
                res.json({
                  "code": '500',
                  "status": "Server Error",
                  "description": "Fail to update status in database"
                });
              })
          } else {
            res.json({
              "code": '500',
              "status": "Server Error",
              "description": "Fail to health check"
            });
          }
        })
    }).catch(err => {
      console.log(err)
      res.json({
        "code": '500',
        "status": "Server Error",
        "description": "Unexpected error"
      });
    })
});

router.get('/handshake', function (req, res, next) {
  var networkInterfaces = os.networkInterfaces();
  DB.query(AgentSql.getSingleAgent(), [req.query.name]).then(result => {
      const headers = {
        'Authorization': 'bearer ' + result[0].jwt,
        'Content-type': 'application/json'
      }
      let body = {}
      body.ID = result[0].id.toString()
      body.NAME = result[0].name
      body.JWT = result[0].jwt
      body.MAIN_SERVER_ADDRESS = 'http://' + networkInterfaces["Wi-Fi"][1].address + ':' + conifg.webport
      axios.defaults.headers.post = null
      axios.post(result[0].address + '/handshake', body, {
          headers
        })
        .then(response => {
          console.log('response from ' + result[0].name + ' agent', response.data)
          DB.query(AgentSql.updatetAgentStatus(result[0].id.toString()), ['stop'])
            .then(result => {
              res.json({
                "code": '200',
                "status": "Success",
                "description": "Successfully Handshake"
              });
            }).catch(err => {
              console.log(err)
            })
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
      });
    })
});

router.post('/cron/start', function (req, res, next) {
  DB.query(AgentSql.getSingleAgent(), [req.query.name]).then(result => {
      const headers = {
        'Authorization': 'bearer ' + result[0].jwt,
        'Content-type': 'application/json'
      }
      axios.defaults.headers.post = null
      axios.post(result[0].address + '/v1/cron/start', null, {
          headers
        })
        .then(response => {
          console.log('response from ' + result[0].name + ' agent', response.data)
          DB.query(AgentSql.updatetAgentStatus(result[0].id.toString()), ['running'])
            .then(result => {
              res.json({
                "code": '200',
                "status": "Success",
                "description": "Successfully Handshake"
              });
            })
            .catch(err => {
              console.log(err)
            })
        })
        .catch(err => {
          console.log(err)
          res.json({
            "code": '500',
            "status": "Server Error",
            "description": "Fail to handshake"
          });
        })
    })
    .catch(err => {
      console.log(err)
      res.json({
        "code": '500',
        "status": "Server Error",
        "description": "Unexpected error"
      });
    })
});

router.get('/cron/stop', function (req, res, next) {
  DB.query(AgentSql.getSingleAgent(), [req.query.name]).then(result => {
      const headers = {
        'Authorization': 'bearer ' + result[0].jwt,
        'Content-type': 'application/json'
      }
      axios.defaults.headers.post = null
      axios.get(result[0].address + '/v1/cron/stop', null, {
          headers
        })
        .then(response => {
          console.log('response from ' + result[0].name + ' agent', response.data)
          DB.query(AgentSql.updatetAgentStatus(result[0].id.toString()), ['stop'])
            .then(result => {
              res.json({
                "code": '200',
                "status": "Success",
                "description": "Successfully Handshake"
              });
            })
            .catch(err => {
              console.log(err)
            })
        })
        .catch(err => {
          console.log(err)
          res.json({
            "code": '500',
            "status": "Server Error",
            "description": "Fail to handshake"
          });
        })
    })
    .catch(err => {
      console.log(err)
      res.json({
        "code": '500',
        "status": "Server Error",
        "description": "Unexpected error"
      });
    })
});

router.post('/v1/windows/resource/receive', function (req, res, next) {
  console.log("########request#####", req.headers);
  console.log("########request#####", req.query);
  console.log("########request#####", req.body);
  let body = req.body
  let resourceData = calculateResource(body, "windows")
  let token = req.headers.authorization.split(" ")
  token = token[1]

  DB.query(AgentSql.getSingleAgent(), [req.query.name]).then(result => {
    let hashSecret = crypto.createHash("sha512").update(result[0].id.toString()).digest("hex");
    let tokenCheck = jwt.veryfyToekn(token, hashSecret)
    if (tokenCheck !== null) {
      // insert resource data in DB
      const uuid = Uuid.random();
      DB.query(ResourceSql.insertResource(), [uuid, result[0].id, resourceData.cpu, resourceData.mem, resourceData.disk]).then(result2 => {
        console.log(result2);
        res.json({
          "code": '200',
          "status": "success"
        });
      }).catch(err => {
        console.log('Database error', err)
        res.json({
          "code": '500',
          "status": "server error"
        });
      })
    } else {
      res.json({
        "code": '401',
        "status": "Unahtorized"
      });
    }
  }).catch(err => {
    console.log('Database error', err)
    res.json({
      "code": '500',
      "status": "server error"
    });
  })

});

router.post('/v1/linux/resource/receive', function (req, res, next) {
  let body = req.body
  let resourceData = calculateResource(body, "linux")
  let token = req.headers.authorization.split(" ")
  token = token[1]
  DB.query(AgentSql.getSingleAgent(), [req.query.name]).then(result => {
      let hashSecret = crypto.createHash("sha512").update(result[0].id.toString()).digest("hex");
      let tokenCheck = jwt.veryfyToekn(token, hashSecret)
      console.log(tokenCheck);
      // insert resource data in DB
      const uuid = Uuid.random();
      DB.query(ResourceSql.insertResource(), [uuid, result[0].id, resourceData.cpu, resourceData.mem, resourceData.disk]).then(result2 => {
          console.log(result2);
        })
        .catch(err => {
          console.log(err)
        })
    })
    .catch(err => {
      console.log(err)
    })
  res.json({
    "code": '200',
    "status": "success"
  });
});


function calculateResource(data, os) {
  let cpu = ""
  let mem = ""
  let disk = ""
  let result = {}
  if (os === "windows") {
    cpu = data.cpu[0].Average
    mem = Math.round(100 * (Number(data.mem[0].FreePhysicalMemory) / Number(data.mem[0].TotalPhysicalMemory)))
    disk = Math.round(100 * (Number(data.disk[0].FreeSpace) / Number(data.disk[0].Size)))

    result.cpu = cpu
    result.mem = mem.toString()
    result.disk = disk.toString()
    return result
  } else if (os === "linux") {
    cpu = data.cpu[0].replace(/\n/g, '');
    mem = Math.round(100 * ((Number(data.mem.total) - Number(data.mem.free) - Number(data.mem["buff/cache"])) / Number(data.mem.total)))
    //let rootDisk = data.disk.filter(it => new RegExp('root', "i").test(it.Mounted))
    //console.log('####root',rootDisk);
    disk = Math.round(100 * (Number(data.disk[4].Used) / Number(data.disk[4]['1K-blocks'])))
    result.cpu = cpu
    result.mem = mem.toString()
    result.disk = disk.toString()
    return result
  }

}

function getDateFormat(rawDate) {
  var date = new Date(rawDate);
  const transformedDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
  return transformedDate
}
module.exports = router;