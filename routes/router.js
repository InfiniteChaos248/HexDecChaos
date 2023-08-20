var express = require('express');
var router = express.Router();

const dotenv = require('dotenv');
dotenv.config({path: '../.env'});

var {checkLoginStatus, checkNotAuthenticated} = require('../util/userUtil');

function render_options(req, showPage) {
  uid = req.user ? req.user.id : -1;
  username = req.user ? req.user.username : req.session.username;
  loggedIn = req.user;
  options = { 
    title: 'HexDecChaos!', 
    show: showPage,
    uid: uid, 
    username: username, 
    loggedIn: loggedIn, 
    url: process.env.ROOT_URL 
  };
  return options;
}

/* GET home page. */
router.get('/', checkLoginStatus, function(req, res, next) {
  res.render('home', render_options(req, 'home'));
});

/* GET toolbox page. */
router.get('/toolbox', checkLoginStatus, function(req, res, next) {
  res.render('home', render_options(req, 'toolbox'));
});

/* GET tool page. */
router.get('/toolbox/:tool', checkLoginStatus, function(req, res, next) {
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
  if (toolName == "bday") {
    showPage = "bday";
  }
  res.render('home', render_options(req, showPage));
});

/* GET games page. */
router.get('/games', checkLoginStatus, function(req, res, next) {
  res.render('home', render_options(req, 'games'));
});

router.get('/game/:game', checkLoginStatus, function(req, res, next) {
  gameName = req.params.game;
  showPage = "games"
  if (gameName == "instate") {
    showPage = "instate";
  }
  res.render('home', render_options(req, showPage));
});

/* GET blogspace page. */
router.get('/blogspace', checkLoginStatus, function(req, res, next) {
  res.render('home', render_options(req, 'blogspace'));
});

/* GET about page. */
router.get('/about', checkLoginStatus, function(req, res, next) {
  res.render('home', render_options(req, 'about'));
});

/* GET Login page. */
router.get('/login', checkNotAuthenticated, function(req, res, next) {
  var options = render_options(req, 'login');
  options.username = '?';
  res.render('home', options);
});

/* GET Signup page. */
router.get('/signup', checkNotAuthenticated, function(req, res, next) {
  var options = render_options(req, 'signup');
  options.username = '?';
  res.render('home', options);
});

module.exports = router;
