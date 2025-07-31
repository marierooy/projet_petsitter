const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contract.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.post('/', authMiddleware, contractController.createContract);
router.get('/', authMiddleware, contractController.getUserContracts);

module.exports = router;