const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const csrfProtection = require('../middlewares/csrf.middleware');

router.post('/', csrfProtection, authMiddleware, contractController.createContract);
router.get('/', csrfProtection, authMiddleware, contractController.getUserContracts);
router.delete('/:id', csrfProtection, authMiddleware, contractController.deleteContract);
router.post('/:id/validate', csrfProtection, authMiddleware, contractController.validateContract);
router.get('/petsitter/owner/:petsitterId', csrfProtection, authMiddleware, contractController.getContractsByPetsitterIdOwnerId);

module.exports = router;