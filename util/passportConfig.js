const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const passport = require('passport');

const db = require('./database');

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

  module.exports = passport;