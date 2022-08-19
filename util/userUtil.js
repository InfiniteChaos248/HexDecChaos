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
      req.session.username = generate_random_username();
    }
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }
    next();
  }

  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  }

  module.exports =  {generate_random_username, checkLoginStatus, checkAuthenticated, checkNotAuthenticated};