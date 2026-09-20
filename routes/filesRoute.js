const router = require('express').Router();
const requireAuth = require('../middleware/authenticate');
const files = require('../controllers/fileController');

router.use(requireAuth);

router.post('/upload', files.upload);
router.get('/:fileId/download', files.download);
router.post('/:fileId/delete', files.remove);

module.exports = router;
