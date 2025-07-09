const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { roleMiddleware } = require('../middlewares/role.middleware');
const { authMiddleware } = require('../middlewares/auth.middleware');
const serviceOccurenceController = require('../controllers/serviceOccurence.controller');

router.get('/', authMiddleware, serviceController.getAll);
router.get('/:id/occurences', authMiddleware, roleMiddleware('admin'), serviceOccurenceController.getOccurencesByService);
router.put('/:id/occurences', authMiddleware, roleMiddleware('admin'), serviceOccurenceController.updateOccurencesForService);

module.exports = router;