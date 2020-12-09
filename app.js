const createError = require('http-errors');
const express = require('express');
const path = require('path');
const conf = require('./config')

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')

const morgan = require('morgan');
const winston = require('./winston')

const session = require('express-session');
const passport = require('passport')
const flash = require('express-flash');
const initPassport = require('./auth/passport');
const redis = require('redis')
const redisStore  = require('connect-redis')(session)
const redisClient = require('./db/redis')
// const FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var jwtRouter = require('./routes/jwt');
var agentRouter = require('./routes/agent');

var app = express();
// session setting
app.use(session({
  key: 'sid',
  name: 'sessionId',
  secret: 'example',
  resave: false,
  saveUninitialized: false,
  store: new redisStore({client: redisClient})
  // store: new FileStore({logFn: function(){}})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(morgan('combined', {
  "stream": winston.stream
}
));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
initPassport(passport);
app.use(bodyParser.json())
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'js')));
app.use('/css', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')));
app.use('/chart', express.static(path.join(__dirname, 'node_modules', 'chart.js', "dist")));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/auth/jwt', jwtRouter);
app.use('/agent', agentRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;