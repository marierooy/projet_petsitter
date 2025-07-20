const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matching.controller');

router.post('/', matchingController.findMatchingPetsitters);

module.exports = router;