const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;

const userController = require('../controllers/userController')
// remove when db install


passport.use(
  new LocalStrategy(userController.postLogIn)
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(userController.deserializeUser);

module.exports = passport