const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const { validateRegister } = require('../middlewares/validateUser');

router.post('/register', validateRegister, userCtrl.register);
router.post('/login', userCtrl.login);

module.exports = router;