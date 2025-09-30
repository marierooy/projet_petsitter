const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { validateRegister } = require('../middlewares/validateUser');
const csrfProtection = require('../middlewares/csrf.middleware');

router.post('/register', csrfProtection, validateRegister, userCtrl.register);
router.post('/login', csrfProtection, userCtrl.login);
router.get('/me', csrfProtection, authMiddleware, userCtrl.getCurrentUser );
router.post('/logout', csrfProtection, userCtrl.logout);

module.exports = router;