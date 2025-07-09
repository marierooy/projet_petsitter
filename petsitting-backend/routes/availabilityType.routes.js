const express = require('express');
const router = express.Router();
const controller = require('../controllers/availabilityType.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

router.post('/new', authMiddleware, roleMiddleware('petsitter'), controller.create);
router.put('/:id', authMiddleware, roleMiddleware('petsitter'), controller.update);
router.delete('/:id', authMiddleware, roleMiddleware('petsitter'), controller.remove);
router.get('/', authMiddleware, roleMiddleware('petsitter'), controller.list);

module.exports = router;