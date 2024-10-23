var express = require('express');
var router = express.Router();
var fileController = require('../controllers/fileController')
const multer = require('multer')
const upload = multer({dest: 'uploads/'})

router.get('/api', fileController.getFiles)

router.post('/upload', upload.single('file'), fileController.postFile)

router.get('/delete/:fileId/:fileName', fileController.deleteFile)

router.get('/download/:fileId', fileController.downloadFile)
module.exports = router;