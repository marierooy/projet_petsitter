const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer.controller');
const offerServiceOccurenceController = require('../controllers/offerServiceOccurence.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const csrfProtection = require('../middlewares/csrf.middleware');

// PUT /api/offer/:animalId
// router.put('/:animalTypeId', authMiddleware, offerController.updateOfferByAnimalId);
router.put('/bulk', csrfProtection, authMiddleware, offerController.updateMultipleOffers);
router.post('/synthetic/:petsitterId', csrfProtection, authMiddleware, offerController.saveSyntheticOffers);
router.post('/:offerId/service', csrfProtection, authMiddleware, offerServiceOccurenceController.addServiceOccurenceToOffer);
router.delete('/:offerId/service/:id', csrfProtection, authMiddleware, offerServiceOccurenceController.removeServiceOccurenceFromOffer);
router.put('/:offerId/service/:osoId', csrfProtection, authMiddleware, offerServiceOccurenceController.updateOfferServiceOccurence);

module.exports = router;