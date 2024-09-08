var express = require('express');
var router = express.Router();
const passport = require("../authenticate/passport")
const multer = require('multer')
const upload = multer({ dest: 'uploads/'})
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { user: req.user, title: 'Express' });
});


router.get('/upload', function(req, res, next) {
    res.render('upload')
})
router.post('/upload', upload.single('uploaded_file'), function(req, res, next) {
  console.log(req.file, req.body)
})

module.exports = router;
