const express = require('express');
const router = express.Router();
const animalController = require('../controllers/animal.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, animalController.getAnimalsByUser);
router.post('/add', authMiddleware, animalController.createAnimal);
router.put('/:id/edit', authMiddleware, animalController.updateAnimal);
router.delete('/:id/delete', authMiddleware, animalController.deleteAnimal);

module.exports = router;