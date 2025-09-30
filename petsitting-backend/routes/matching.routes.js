const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matching.controller');
const csrfProtection = require('../middlewares/csrf.middleware');

router.post('/', csrfProtection, matchingController.findMatchingPetsitters);

module.exports = router;