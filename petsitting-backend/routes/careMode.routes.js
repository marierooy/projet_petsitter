const express = require('express');
const router = express.Router();
const careModeController = require('../controllers/careMode.controller');

router.get('/', careModeController.getCareModes);

module.exports = router;