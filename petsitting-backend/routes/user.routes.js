const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const upload = require('../utils/fileUpload');

router.get('/me', authMiddleware, userController.getCurrentUser);
router.put('/me', authMiddleware, upload.single('photo'), userController.updateCurrentUser);
router.get('/petsitter/:id', userController.getPetsitterProfile);

module.exports = router;