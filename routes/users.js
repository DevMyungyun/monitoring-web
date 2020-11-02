const { log } = require('debug');
const express = require('express');
const router = express.Router();
const db = require('../db/db.js')
const userSql = require('../db/sql/user.js')
const crypto = require('crypto')

const UserSql = new userSql()
const DB = new db()

router.get('/signup', function(req, res, next) {
  res.render("/user/signup");
});

router.post("/signup", function(req,res,next){
  let body = req.body;
  let hashPassword = crypto.createHash("sha512").update(body.password).digest("hex");

  let params = [body.userName, body.userEmail, hashPassword]
  // console.log('>>',params);
  // console.log('>>', typeof UserSql.insertUser());
  // console.log('>>', UserSql.insertUser());
  DB.query(UserSql.insertUser(), params).then(rows => {
    console.log('rows',rows);
  })
  res.redirect("/user/signup");
})

router.get('/login', function(req, res, next) {
  let session = req.session;
  if(req.session) {
    res.redirect('/main')
  } else {
    res.render("/user/login", {
      session : session
    });
  }
});

router.post("/login", async function(req,res,next){
  let body = req.body;
  DB.query(UserSql.getSingleUser(), [body.userEmail]).then(rows => {
    console.log('rows',rows[0]);
    
    let dbPassword = rows[0].password;
    let inputPassword = body.password;
    let hashPassword = crypto.createHash("sha512").update(inputPassword).digest("hex");
    if(dbPassword === hashPassword){
      console.log("Successfully match password");
      // Cookie setting
      // res.cookie("user", body.userEmail , {
      //   expires: new Date(Date.now() + 900000),
      //   httpOnly: true
      // });
      // Session setting
      req.session.email = body.userEmail;
      res.redirect("/main");
    } else{
      console.log("Fail to match password");
      res.redirect("/user/login");
    }
  })
});

router.get("/logout", function(req,res,next){
  sess = req.session;
  console.log('##session', sess);
  if(sess.email){
    res.clearCookie("sid")
    req.session.destroy(function(err){
      if(err){
          console.log(err);
      }else{
          res.redirect('/user/login');
      }
    })
  }else{
    res.redirect('/user/login');
  }
})

// session confirm
router.route('/confirmSession').get(function (req, res) {
  console.log('check the session!');
  let msg = `no session exist..`
  if (req.session) {
      msg = `${req.session.key} session key and session : ${req.session}`;
  }
  res.send(msg);
});

module.exports = router;