const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animal.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const csrfProtection = require('../middlewares/csrf.middleware');

router.get('/', csrfProtection, authMiddleware, animalController.getAnimalsByUser);
router.post('/add', csrfProtection, authMiddleware, animalController.createAnimal);
router.put('/:id/edit', csrfProtection, authMiddleware, animalController.updateAnimal);
router.delete('/:id/delete', csrfProtection, authMiddleware, animalController.deleteAnimal);
router.get('/services/occurences', csrfProtection, authMiddleware, animalController.getUserAnimalsWithServices);

module.exports = router;