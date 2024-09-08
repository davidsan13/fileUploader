var express = require('express');
var router = express.Router();
const passport = require("../authenticate/passport")

var userController = require('../controllers/userController')

router.post('/log-in',  passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/"
}))


router.get('/log-out', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get('/sign-up', (req, res, next) => {
  res.render('sign-up');
})

router.post('/sign-up', userController.postSignUp)
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//CRUD
router.get('/folder/create', userController.getFolderCreate)

router.post('/folder/create', userController.postFolderCreate)

router.get('/folder', userController.getFolder)

router.get('/folder/update/:folderId/', userController.getFolderUpdate)

router.post('/folder/update/:folderId', userController.postFolderUpdate)

router.get('/folder/delete/:folderId', userController.getFolderDelete)

router.post('/folder/delete/:folderId', userController.postFolderDelete)

module.exports = router;
