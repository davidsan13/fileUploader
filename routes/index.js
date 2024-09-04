var express = require('express');
var router = express.Router();
const passport = require("../authenticate/passport")
const multer = require('multer')
const upload = multer({ dest: 'uploads/'})
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

router.get('/upload', function(req, res, next) {
    res.render('upload')
})
router.post('/upload', upload.single('uploaded_file'), function(req, res, next) {
  console.log(req.file, req.body)
})

module.exports = router;
