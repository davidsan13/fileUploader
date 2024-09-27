var express = require('express');
var router = express.Router();
const passport = require("../middleware/passport")
const multer = require('multer')
const upload = multer({ dest: 'uploads/'})
/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/folders')
});


router.get('/upload', function(req, res, next) {
    res.render('upload')
})
router.post('/upload', upload.single('uploaded_file'), function(req, res, next) {
  console.log(req.file, req.body)
})

module.exports = router;
