var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController')
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
