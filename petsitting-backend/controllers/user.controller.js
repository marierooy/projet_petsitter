const userService = require('../services/user.service');

const register = async (req, res) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json({ message: 'Compte créé', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.login(email, password);
    res.json({ message: 'Connexion réussie', user, token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = { register, login };