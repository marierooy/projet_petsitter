const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('email').isEmail().withMessage("Email invalide"),
  body('password')
    .isLength({ min: 12 })
    .withMessage("Mot de passe trop court")
    .matches(/[A-Z]/)
    .withMessage("Le mot de passe doit contenir au moins une majuscule")
    .matches(/[a-z]/)
    .withMessage("Le mot de passe doit contenir au moins une minuscule")
    .matches(/\d/)
    .withMessage("Le mot de passe doit contenir au moins un chiffre")
    .matches(/[-_!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Le mot de passe doit contenir au moins un caractère spécial"),
  body('roles').isArray({ min: 1 }).withMessage("Au moins un rôle est requis"),
  body('roles.*').isIn(["petsitter", "owner"]).withMessage("Rôle invalide"),
  body('first_name').notEmpty().withMessage("Le prénom est requis"),
  body('last_name').notEmpty().withMessage("Le nom est requis"),

  // Paramètres optionnels (aucune validation stricte)
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('postal_code').optional().isString(),
  body('city').optional().isString(),
  body('country').optional().isString(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
    validateRegister,
};