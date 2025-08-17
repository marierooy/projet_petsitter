const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, contractController.createContract);
router.get('/', authMiddleware, contractController.getUserContracts);
router.delete('/:id', authMiddleware, contractController.deleteContract);
router.post('/:id/validate', authMiddleware, contractController.validateContract);
router.get('/petsitter/owner/:petsitterId', authMiddleware, contractController.getContractsByPetsitterIdOwnerId);

module.exports = router;