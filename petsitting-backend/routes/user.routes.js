const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const upload = require('../utils/fileUpload');
const csrfProtection = require('../middlewares/csrf.middleware.js');

router.get('/me', csrfProtection, authMiddleware, userController.getCurrentUserById);
router.put('/me', csrfProtection, authMiddleware, upload.single('photo'), userController.updateCurrentUser);
router.get('/petsitter/:id', csrfProtection, userController.getPetsitterProfile);

module.exports = router;