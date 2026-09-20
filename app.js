require('dotenv').config(); // must run before anything reads process.env

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');

const prisma = require('./lib/prisma');
const passport = require('./middleware/passport');
const csrf = require('./middleware/csrf');
const flash = require('./middleware/flash');
const format = require('./lib/format');

const isProd = process.env.NODE_ENV === 'production';
if (!process.env.SESSIONSECRET) throw new Error('SESSIONSECRET must be set in .env');

const app = express();
if (isProd) app.set('trust proxy', 1);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.disable('x-powered-by');
Object.assign(app.locals, format);

// Basic security headers (no inline scripts/styles are used, so a strict CSP works).
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Content-Security-Policy':
      "default-src 'self'; img-src 'self' data:; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  });
  next();
});

app.use(logger(isProd ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    name: 'fileuploader.sid',
    secret: process.env.SESSIONSECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);
app.use(passport.session());
app.locals.maxUploadMb = parseInt(process.env.MAX_UPLOAD_MB, 10) || 25;
app.use(csrf);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store'); // pages embed a per-session CSRF token
  next();
});
app.use(flash);
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/usersRoute'));
app.use('/folders', require('./routes/foldersRoute'));
app.use('/files', require('./routes/filesRoute'));

app.use((req, res, next) => next(createError(404, 'Page not found')));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status);
  if (req.xhr || (req.get('accept') || '').includes('application/json')) {
    return res.json({ error: status >= 500 ? 'Something went wrong' : err.message });
  }
  res.render('error', {
    title: status === 404 ? 'Not found' : 'Something went wrong',
    status,
    message: status >= 500 && isProd ? 'Something went wrong on our side.' : err.message,
    stack: isProd ? null : err.stack,
  });
});

module.exports = app;
