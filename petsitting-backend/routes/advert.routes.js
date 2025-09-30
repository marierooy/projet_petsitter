const express = require('express');
const router = express.Router();
const advertController = require('../controllers/advert.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const csrfProtection = require('../middlewares/csrf.middleware');

router.post('/', csrfProtection, authMiddleware, advertController.createAdvert);
router.get('/recent', csrfProtection, authMiddleware, advertController.getRecentAdverts);
router.get('/upcoming', csrfProtection, authMiddleware, advertController.getUpcomingAdverts);
router.delete('/:id', csrfProtection, authMiddleware, advertController.deleteAdvert);

module.exports = router;