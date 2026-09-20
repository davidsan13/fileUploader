const crypto = require('crypto');

// Minimal synchronizer-token CSRF protection. Forms send `_csrf`; fetch/XHR
// (including multipart uploads) send the `x-csrf-token` header.
module.exports = function csrf(req, res, next) {
  if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  res.locals.csrfToken = req.session.csrfToken;

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const sent = Buffer.from(String(req.get('x-csrf-token') || (req.body && req.body._csrf) || ''));
  const expected = Buffer.from(req.session.csrfToken);
  if (sent.length === expected.length && crypto.timingSafeEqual(sent, expected)) return next();

  const err = new Error('Your session expired or the form was invalid. Please go back and try again.');
  err.status = 403;
  next(err);
};
