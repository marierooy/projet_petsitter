const express = require('express');
const router = express.Router();
const evaluateController = require('../controllers/evaluate.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { roleMiddleware } = require('../middlewares/role.middleware');

router.post('/', authMiddleware, evaluateController.createEvaluate);
router.get('/:petsitterId', evaluateController.getEvaluationsByPetsitter);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), evaluateController.deleteEvaluation);

module.exports = router;