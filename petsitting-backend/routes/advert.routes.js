const express = require('express');
const router = express.Router();
const advertController = require('../controllers/advert.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, advertController.createAdvert);
router.get('/recent', authMiddleware, advertController.getRecentAdverts);
router.get('/upcoming', authMiddleware, advertController.getUpcomingAdverts);
router.delete('/:id', authMiddleware, advertController.deleteAdvert);

module.exports = router;