// Tiny flash-message helper: req.flash('success', 'Saved') -> shown once on next page.
module.exports = function flash(req, res, next) {
  req.flash = (type, message) => {
    if (!req.session.flash) req.session.flash = [];
    req.session.flash.push({ type, message });
  };
  res.locals.flash = req.session.flash || [];
  delete req.session.flash;
  next();
};
