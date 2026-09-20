const router = require('express').Router();
const { requireGuest } = require('../middleware/authenticate');
const rateLimit = require('../middleware/rateLimit');
const users = require('../controllers/userController');

router.get('/login', requireGuest, users.getLogin);
router.post('/login', requireGuest, rateLimit({ max: 10 }), users.postLogin);
router.get('/signup', requireGuest, users.getSignup);
router.post('/signup', requireGuest, rateLimit({ max: 20 }), users.postSignup);
router.post('/logout', users.postLogout);

module.exports = router;
