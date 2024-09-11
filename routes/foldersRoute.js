var express = require('express');
var router = express.Router();
var folderController = require('../controllers/folderController')

router.get('/', folderController.getAllFolder)

router.get('/create', folderController.getFolderCreate)

router.post('/create', folderController.postFolderCreate)

router.get('/:folderId', folderController.getFolder)

router.get('/update/:folderId/', folderController.getFolderUpdate)

router.post('/update/:folderId', folderController.postFolderUpdate)

// router.get('/delete/:folderId', folderController.getFolderDelete)

router.post('/:folderId/delete', folderController.postFolderDelete)


router.post('/:folderId', function (req, res) {
  const show_modal = !!req.body.modal;
  res.render("folder", {show_modal})
})
module.exports = router;