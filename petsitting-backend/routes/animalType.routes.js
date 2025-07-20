const express = require('express');
const router = express.Router();
const animalTypeController = require('../controllers/animalType.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { getServicesForAnimalType, updateServicesForAnimalType, getServicesAndOccurencesUnified } = require('../controllers/animalTypeService.controller');
const offerController = require('../controllers/offer.controller');

router.get('/', animalTypeController.getAllAnimalTypes);
router.get('/:id/services', authMiddleware, roleMiddleware('admin'), getServicesForAnimalType);
router.put('/:id/services', authMiddleware, roleMiddleware('admin'), updateServicesForAnimalType);
router.get('/services/occurences', getServicesAndOccurencesUnified);
router.get('/offer', authMiddleware, offerController.getOffers);

module.exports = router;
