var express = require('express');
var router = express.Router();
const passport = require("../authenticate/passport")
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { user: req.user, title: 'Express' });
});

router.post('/log-in',  passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/"
}))


router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});
module.exports = router;
