var express = require('express');
var controller = express.Router();

const bcrypt = require('bcryptjs');

const db = require('../util/database');
const passport = require('../util/passportConfig');

var {checkAuthenticated, checkNotAuthenticated} = require('../util/userUtil');

controller.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));
  
  controller.get('/logout', checkAuthenticated, (req, res) => {
    req.logout((err) => {
      if (err) throw err;
      res.redirect('/');
    });
  });
  
  controller.post('/signup', checkNotAuthenticated, (req, res) => {
    email = req.body.email;
    username = req.body.username;
    password = req.body.password;
    hashedPassword = bcrypt.hashSync(password, Number(process.env.BCRYPT_SALT_VERSION));
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
  
  controller.post('/submitComment', (req, res) => {
    let insert = 'INSERT INTO comment (comment, create_ts) VALUES (?, datetime())';
    db.run(insert, [req.body.comment], (result, err) => {
      if (err) throw err;
      res.status(200).send("submitted");
    });
  });

  module.exports = controller;