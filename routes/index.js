const router = require('express').Router();

router.get('/', (req, res) => res.redirect('/folders'));

router.get('/csrf-token', (req, res) => res.json({ token: res.locals.csrfToken }));

module.exports = router;
