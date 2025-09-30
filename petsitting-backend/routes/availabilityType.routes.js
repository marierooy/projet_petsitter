const express = require('express');
const router = express.Router();
const controller = require('../controllers/availabilityType.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const csrfProtection = require('../middlewares/csrf.middleware');

router.post('/new', csrfProtection, authMiddleware, roleMiddleware('petsitter'), controller.create);
router.put('/:id', csrfProtection, authMiddleware, roleMiddleware('petsitter'), controller.update);
router.delete('/:id', csrfProtection, authMiddleware, roleMiddleware('petsitter'), controller.remove);
router.get('/', csrfProtection, authMiddleware, roleMiddleware('petsitter'), controller.list);

module.exports = router;