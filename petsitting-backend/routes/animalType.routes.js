const express = require('express');
const router = express.Router();
const animalTypeController = require('../controllers/animalType.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { getServicesForAnimalType, updateServicesForAnimalType, getServicesAndOccurencesUnified } = require('../controllers/animalTypeService.controller');
const offerController = require('../controllers/offer.controller');
const csrfProtection = require('../middlewares/csrf.middleware');

router.get('/', csrfProtection, animalTypeController.getAllAnimalTypes);
router.get('/:id/services', csrfProtection, authMiddleware, getServicesForAnimalType);
router.put('/:id/services', csrfProtection, authMiddleware, roleMiddleware('admin'), updateServicesForAnimalType);
router.get('/services/occurences', csrfProtection, getServicesAndOccurencesUnified);
router.get('/offer', csrfProtection, authMiddleware, offerController.getOffers);

module.exports = router;
