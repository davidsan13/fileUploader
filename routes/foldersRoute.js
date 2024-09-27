var express = require('express');
var router = express.Router();
var folderController = require('../controllers/folderController')

const isAuthenticated = require('../middleware/authenticate')

router.get('/', isAuthenticated, folderController.getAllFolder)

router.get('/create', folderController.getFolderCreate)

router.post('/create', folderController.postFolderCreate)

router.get('/:folderId', folderController.getFolder)

router.post('/:folderId/update', folderController.postFolderUpdate)

router.post('/:folderId/delete', folderController.postFolderDelete)



module.exports = router;