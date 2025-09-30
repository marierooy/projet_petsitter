const express = require('express');
const router = express.Router();
const careModeController = require('../controllers/careMode.controller');
const csrfProtection = require('../middlewares/csrf.middleware');

router.get('/', csrfProtection, careModeController.getCareModes);

module.exports = router;