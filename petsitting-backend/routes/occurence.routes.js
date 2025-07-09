const express = require('express');
const router = express.Router();
const occurenceController = require('../controllers/occurence.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, occurenceController.getAllOccurences);

module.exports = router;