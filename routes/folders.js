var express = require('express');
var router = express.Router();
var folderController = require('../controllers/folderController')

router.get('/folder/create', folderController.getFolderCreate)

router.post('/folder/create', folderController.postFolderCreate)

router.get('/folder', folderController.getFolder)

router.get('/folder/update/:folderId/', folderController.getFolderUpdate)

router.post('/folder/update/:folderId', folderController.postFolderUpdate)

router.get('/folder/delete/:folderId', folderController.getFolderDelete)

router.post('/folder/delete/:folderId', folderController.postFolderDelete)

module.exports = router;