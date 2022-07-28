var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var appRouter = require('./routes/router');

const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const passport = require('passport')
const sqlite3 = require('sqlite3').verbose()
const db_name = path.join(__dirname, "data", "apptest.db");
const db = new sqlite3.Database(db_name)
const session = require('express-session')
const flash = require('express-flash')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash())
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.use('/', appRouter);

passport.use(new LocalStrategy((username, password, done) => {
  db.get('SELECT * FROM USER WHERE username = ?', username, function (err, row) {
    if (err) throw err;
    if (!row) return done(null, false, { message: "User not found" });
    if (bcrypt.compareSync(password, row.password)) {
      return done(null, row)
    } else {
      return done(null, false, { message: 'Password incorrect' })
    }
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  db.get("SELECT * FROM USER WHERE username = ?", username, (err, row) => {
    if (err) throw err;
    if (!row) done(null, false);
    done(null, row);
  });
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/logout', checkAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) throw err;
    res.redirect('/');
  });
})

app.post('/signup', checkNotAuthenticated, (req, res) => {
  email = req.body.email;
  username = req.body.username;
  password = req.body.password;
  hashedPassword = bcrypt.hashSync(password, 10);
  db.get("SELECT * FROM USER WHERE username = ?", username, (err, row) => {
    if (err) throw err;
    if (row) {
      req.flash('error', 'username is already taken, please use a different one')
      res.redirect('/signup')
    } else {
      db.get("SELECT * FROM USER WHERE email = ?", email, (err, row) => {
        if (err) throw err;
        if (row) {
          req.flash('error', 'email is already taken, please use a different one')
          res.redirect('/signup')
        } else {
          let insert = 'INSERT INTO USER (username, email, password, create_ts) VALUES (?, ?, ?, datetime())';
          db.run(insert, [username, email, hashedPassword], (result, err) => {
            if (err) throw err;
            req.flash('error', 'user added successfully, you can Login now')
            res.redirect('/login')
          });
        }
      });
    }
  });
});

app.post('/submitComment', (req, res) => {
  let insert = 'INSERT INTO comment (comment, create_ts) VALUES (?, datetime())';
  db.run(insert, [req.body.comment], (result, err) => {
    if (err) throw err;
    res.status(200).send("submitted");
  });
});

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
