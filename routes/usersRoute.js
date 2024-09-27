var express = require('express');
var router = express.Router();
const passport = require("../middleware/passport")

var userController = require('../controllers/userController')

router.post('/login',  passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/"
}))

router.get('/login', userController.getLogin)

router.get('/logout', userController.getLogout)

router.get('/signup', userController.getSignup)

router.post('/sign-up', userController.postSignUp)



module.exports = router;
