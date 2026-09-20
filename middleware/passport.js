const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

// Same message for unknown user and wrong password so usernames can't be probed.
const INVALID = { message: 'Invalid username or password' };
// Compared against when the user doesn't exist, so response time doesn't leak that fact.
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.4v5wKZtBhH0mI9v1t3v9Zc0yF7nC';

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { username: username.trim() } });
      const match = await bcrypt.compare(password, user?.password || DUMMY_HASH);
      return done(null, user && match ? user : false, INVALID);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
