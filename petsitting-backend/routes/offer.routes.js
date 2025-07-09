const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// PUT /api/offer/:animalId
// router.put('/:animalTypeId', authMiddleware, offerController.updateOfferByAnimalId);
router.put('/bulk', authMiddleware, offerController.updateMultipleOffers);

module.exports = router;