const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');
const serviceOccurenceController = require('../controllers/serviceOccurence.controller');
const csrfProtection = require('../middlewares/csrf.middleware.js');

router.get('/', csrfProtection, authMiddleware, serviceController.getAll);
router.get('/:id/occurences', csrfProtection, authMiddleware, serviceOccurenceController.getOccurencesByService);
router.put('/:id/occurences', csrfProtection, authMiddleware, roleMiddleware('admin'), serviceOccurenceController.updateOccurencesForService);

module.exports = router;