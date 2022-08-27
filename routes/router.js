var express = require('express');
var router = express.Router();

var {checkLoginStatus, checkNotAuthenticated} = require('../util/userUtil');

/* GET home page. */
router.get('/', checkLoginStatus, function(req, res, next) {
  username = req.user ? req.user.username : req.session.username;
  loggedIn = req.user;
  res.render('home', { title: 'HexDecChaos!', show: 'home', username: username, loggedIn: loggedIn });
});

/* GET toolbox page. */
router.get('/toolbox', checkLoginStatus, function(req, res, next) {
  username = req.user ? req.user.username : req.session.username;
  loggedIn = req.user;
  res.render('home', { title: 'HexDecChaos!', show: 'toolbox', username: username, loggedIn: loggedIn });
});

/* GET tool page. */
router.get('/toolbox/:tool', checkLoginStatus, function(req, res, next) {
  username = req.user ? req.user.username : req.session.username;
  loggedIn = req.user;
  toolName = req.params.tool;
  showPage = "toolbox"
  if (toolName == "roll") {
    showPage = "roll";
  }
  if (toolName == "toss") {
    showPage = "toss";
  }
  if (toolName == "gen") {
    showPage = "gen";
  }
  res.render('home', { title: 'HexDecChaos!', show: showPage, username: username, loggedIn: loggedIn });
});

/* GET games page. */
router.get('/games', checkLoginStatus, function(req, res, next) {
  username = req.user ? req.user.username : req.session.username;
  loggedIn = req.user;
  res.render('home', { title: 'HexDecChaos!', show: 'games', username: username, loggedIn: loggedIn });
});

/* GET blogspace page. */
router.get('/blogspace', checkLoginStatus, function(req, res, next) {
  username = req.user ? req.user.username : req.session.username;
  loggedIn = req.user;
  res.render('home', { title: 'HexDecChaos!', show: 'blogspace', username: username, loggedIn: loggedIn});
});

/* GET about page. */
router.get('/about', checkLoginStatus, function(req, res, next) {
  username = req.user ? req.user.username : req.session.username;
  loggedIn = req.user;
  res.render('home', { title: 'HexDecChaos!', show: 'about', username: username, loggedIn: loggedIn });
});

/* GET Login page. */
router.get('/login', checkNotAuthenticated, function(req, res, next) {
  res.render('home', { title: 'HexDecChaos!', show: 'login', username: '?', loggedIn: false });
});

/* GET Signup page. */
router.get('/signup', checkNotAuthenticated, function(req, res, next) {
  res.render('home', { title: 'HexDecChaos!', show: 'signup', username: '?', loggedIn: false });
});

module.exports = router;
