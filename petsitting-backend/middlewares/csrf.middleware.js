const csurf = require('csurf');

let csrfProtection;

if (process.env.NODE_ENV === 'test') {
  // en test, on bypass le CSRF
  csrfProtection = (req, res, next) => next();
} else {
  csrfProtection = csurf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "Strict",
    }
  });
}

module.exports = csrfProtection;
