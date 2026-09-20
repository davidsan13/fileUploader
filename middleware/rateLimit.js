// Small in-memory limiter (per IP). Use a shared store such as Redis if you run multiple instances.
module.exports = function rateLimit({ windowMs = 15 * 60 * 1000, max = 10 } = {}) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const entry = hits.get(req.ip) || { count: 0, reset: now + windowMs };
    entry.count += 1;
    hits.set(req.ip, entry);
    if (entry.count > max) {
      res.set('Retry-After', Math.ceil((entry.reset - now) / 1000));
      req.flash('error', 'Too many attempts. Please wait a few minutes and try again.');
      return res.redirect('back');
    }
    next();
  };
};
