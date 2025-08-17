const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer.controller');
const offerServiceOccurenceController = require('../controllers/offerServiceOccurence.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// PUT /api/offer/:animalId
// router.put('/:animalTypeId', authMiddleware, offerController.updateOfferByAnimalId);
router.put('/bulk', authMiddleware, offerController.updateMultipleOffers);
router.post('/synthetic/:petsitterId', authMiddleware, offerController.saveSyntheticOffers);
router.post('/:offerId/service', authMiddleware, offerServiceOccurenceController.addServiceOccurenceToOffer);
router.delete('/:offerId/service/:id', authMiddleware, offerServiceOccurenceController.removeServiceOccurenceFromOffer);
router.put('/:offerId/service/:osoId', authMiddleware, offerServiceOccurenceController.updateOfferServiceOccurence);

module.exports = router;