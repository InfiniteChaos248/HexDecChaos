var express = require('express');
var router = express.Router();

function generate_random_username() {
  const adjectives = ['awesome', 'cool', 'new'];
  const subjects = ['user', 'visitor'];
  var randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  var randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
  var randomNumber = Math.floor(Math.random() * 100);
  return randomAdjective + ' ' +  randomSubject +  ' #' + randomNumber;
}

function checkLoginStatus(req, res, next) {
  if(!req.isAuthenticated() && !req.session.username) {
    req.session.username = generate_random_username()
  }
  next()
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

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
