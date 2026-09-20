const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const passport = require('../middleware/passport');

exports.getSignup = (req, res) => {
  res.render('signup', { title: 'Create account', errors: [], values: {} });
};

exports.postSignup = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters')
    .matches(/^[A-Za-z0-9_.-]+$/).withMessage('Username can only use letters, numbers, dots, dashes and underscores'),
  // Passwords are deliberately NOT trimmed or escaped – that would silently change what the user typed.
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req).array();
      const { username, password } = req.body;
      const rerender = (errs) =>
        res.status(400).render('signup', { title: 'Create account', errors: errs, values: { username } });

      if (errors.length) return rerender(errors);

      const taken = await prisma.user.findUnique({ where: { username } });
      if (taken) return rerender([{ msg: 'That username is already taken' }]);

      const user = await prisma.user.create({
        data: { username, password: await bcrypt.hash(password, 12) },
      });
      req.login(user, (err) => {
        if (err) return next(err);
        req.flash('success', `Welcome, ${user.username}!`);
        res.redirect('/');
      });
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(400).render('signup', {
          title: 'Create account',
          errors: [{ msg: 'That username is already taken' }],
          values: { username: req.body.username },
        });
      }
      next(err);
    }
  },
];

exports.getLogin = (req, res) => {
  res.render('login', { title: 'Log in' });
};

exports.postLogin = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash('error', info?.message || 'Invalid username or password');
      return res.redirect('/users/login');
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.redirect('/');
    });
  })(req, res, next);
};

exports.postLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/users/login');
  });
};
