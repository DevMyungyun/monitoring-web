var createError = require('http-errors');
var express = require('express');
var path = require('path');
const session = require('express-session');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
var logger = require('morgan');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var jwtRouter = require('./routes/jwt');
var agentRouter = require('./routes/agent');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname,  'node_modules', 'bootstrap', 'dist', 'js')));
app.use('/css', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'css')));
app.use('/chart', express.static(path.join(__dirname, 'node_modules', 'chart.js',"dist")));

// session setting
app.use(session({
        key: 'sid',
        secret: 'example',
        cookie:{
            maxAge:24000 * 60 * 60 // 24 hours
        },
        resave: false,
        saveUninitialized: true
}));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/auth/jwt', jwtRouter);
app.use('/agent', agentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
