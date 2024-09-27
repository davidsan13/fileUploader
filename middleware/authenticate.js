function isAuthenticated(req, res, next) {
  if (req.user) {
      return next();
  } else {
      res.redirect('/users/login');  // Redirect to login if user is not authenticated
  }
}

module.exports = isAuthenticated