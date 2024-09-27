var express = require('express');
var router = express.Router();
var fileController = require('../controllers/fileController')

router.get('/api/files', fileController.getfiles)

module.exports = router;