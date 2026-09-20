function wantsJson(req) {
  return req.xhr || (req.get('accept') || '').includes('application/json');
}

function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  if (wantsJson(req)) return res.status(401).json({ error: 'Please log in' });
  res.redirect('/users/login');
}

function requireGuest(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return res.redirect('/');
  next();
}

module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.requireGuest = requireGuest;
