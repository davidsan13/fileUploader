const router = require('express').Router();
const requireAuth = require('../middleware/authenticate');
const folders = require('../controllers/folderController');

router.use(requireAuth);

router.get('/', folders.index);
router.post('/', folders.create);
router.post('/:folderId/rename', folders.rename);
router.post('/:folderId/delete', folders.remove);

module.exports = router;
