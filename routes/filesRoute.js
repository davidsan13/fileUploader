var express = require('express');
var router = express.Router();
var fileController = require('../controllers/fileController')

router.get('/api', fileController.getFiles)

router.post('/upload', fileController.postFile)
module.exports = router;