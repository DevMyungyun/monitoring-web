const { log } = require('debug');
const express = require('express');
const router = express.Router();
const db = require('../db/db.js')
const userSql = require('../db/sql/user.js')
const crypto = require('crypto')
const passport = require('passport');
const session = require('../auth/session')

const UserSql = new userSql()
const DB = new db()

const checkAuth = (req,res,next) =>{ 
  if(req.isAuthenticated()){
      return next();
  }
  res.redirect('/');
}
const checkNotAuth = (req,res,next)=>{
  if(req.isAuthenticated()){
      return res.redirect('/main');
  }
  next();
}

router.get('/signup', function(req, res, next) {
  res.render("signup");
});

router.post("/signup", function(req,res,next){
  let body = req.body;
  let hashPassword = crypto.createHash("sha512").update(body.password).digest("hex");
  let params = [body.userName, body.userEmail, hashPassword]
  
  DB.query(UserSql.insertUser(), params).then(rows => {
    console.log('rows',rows);
  })
  res.redirect("signup");
})

router.get('/login', session.checkNotAuth, function(req, res, next) {
  // if(req.session) {
  //   res.redirect('/main')
  // } else {
  //   res.render("/user/login", {
  //     session : session
  //   });
  // }
  res.render('login');
});

router.post("/login", passport.authenticate('local',{
  successRedirect : '/main',
  failureRedirect : '/user/login',
  failureFlash : true
}));

router.get("/logout", function(req,res,next){
  sess = req.session;
  req.logout();
  req.session.destroy();
  res.clearCookie('sid')
  res.redirect('/user/login');
  // console.log('##session', sess);
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