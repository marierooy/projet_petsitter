const express = require('express');
const router = express.Router();
const evaluateController = require('../controllers/evaluate.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');
const csrfProtection = require('../middlewares/csrf.middleware');

router.post('/', csrfProtection, authMiddleware, evaluateController.createEvaluate);
router.get('/:petsitterId', csrfProtection, evaluateController.getEvaluationsByPetsitter);
router.delete('/:id', csrfProtection, authMiddleware, roleMiddleware('admin'), evaluateController.deleteEvaluation);

module.exports = router;