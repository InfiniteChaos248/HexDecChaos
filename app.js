var express = require('express');
var path = require('path');
const dotenv = require('dotenv');
dotenv.config({path: '../.env'});
var app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const helmet = require('helmet');
app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    "connect-src": ["*"],
    "script-src": ["'self'", "'nonce-" + process.env.SCRIPT_NONCE + "'"]
  }
}))

const flash = require('express-flash');
app.use(flash())

const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie : {
    maxAge: 1000 * 60 * 60 * 24 * process.env.SESSION_EXPIRY_DAYS
  }
}))

var passport = require('./util/passportConfig');
app.use(passport.initialize())
app.use(passport.session())

var logger = require("./log");
logger.stream = {
  write: function(message, encoding){
      logger.info(message);
  }
};
app.use(require('morgan')(process.env.MORGAN_FORMAT, { "stream": logger.stream }));

var cookieParser = require('cookie-parser');
app.use(cookieParser());

var appRouter = require('./routes/router');
app.use('/', appRouter);

var userController = require('./controllers/userController');
app.use('/', userController);

var toolboxController = require('./controllers/toolboxController');
app.use('/', toolboxController);

var eventsController = require('./controllers/eventsController');
app.use('/', eventsController);

var createError = require('http-errors');
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
