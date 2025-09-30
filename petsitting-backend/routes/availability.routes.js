const express = require('express');
const router = express.Router();
const availabityController = require('../controllers/availability.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const csrfProtection = require('../middlewares/csrf.middleware');

router.get('/', csrfProtection, authMiddleware, availabityController.getAllAvailabilitiesByPetsitter);
router.post('/add', csrfProtection, authMiddleware, roleMiddleware('petsitter'), availabityController.createAvailability);
router.put('/:id', csrfProtection, authMiddleware, roleMiddleware('petsitter'), availabityController.updateAvailability);
router.delete('/:id', csrfProtection, authMiddleware, roleMiddleware('petsitter'), availabityController.deleteAvailability);

module.exports = router;