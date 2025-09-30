const express = require('express');
const csrfProtection = require('../middlewares/csrf.middleware.js');

const router = express.Router();

// Route pour fournir un CSRF token au frontend
router.get("/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

module.exports = router;