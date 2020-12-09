const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const db = require('../db/db.js')
const userSql = require('../db/sql/user.js')
const crypto = require('crypto')

const UserSql = new userSql()
const DB = new db()

const initPassport = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'userEmail'
  }, (id, password, done) => {

    DB.query(UserSql.getSingleUser(), [id]).then(rows => {
      console.log('rows', rows[0]);
      console.log('rows', rows);
      if(rows.length === 0)  return done(null, false, {message: 'Incorrect ID'})
      let dbPassword = rows[0].password;
      let hashPassword = crypto.createHash("sha512").update(password).digest("hex");
      if (dbPassword === hashPassword) {
        console.log("Successfully match password");
        return done(null, rows[0].id); 
      } else {
        return done(null, false, {
          message: 'Incorrect Password'
        }); 
      }
    }).catch(e => {
      return done(e); 
    })
  }))

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
}

module.exports = initPassport;