const express = require('express');
const router = express.Router();
const occurenceController = require('../controllers/occurence.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const csrfProtection = require('../middlewares/csrf.middleware');

router.get('/', csrfProtection, authMiddleware, occurenceController.getAllOccurences);

module.exports = router;