const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;

const userController = require('../controllers/userController')

passport.use(
  new LocalStrategy(userController.postLogin)
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(userController.deserializeUser);

module.exports = passport