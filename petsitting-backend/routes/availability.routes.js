const express = require('express');
const router = express.Router();
const availabityController = require('../controllers/availability.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

router.get('/', authMiddleware, availabityController.getAllAvailabilitiesByPetsitter);
router.post('/add', authMiddleware, roleMiddleware('petsitter'), availabityController.createAvailability);
router.put('/:id', authMiddleware, roleMiddleware('petsitter'), availabityController.updateAvailability);
router.delete('/:id', authMiddleware, roleMiddleware('petsitter'), availabityController.deleteAvailability);

module.exports = router;