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

const getCurrentUser = async (req, res) => {
  try {
    const user = await userService.getById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error('Erreur getCurrentUser', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const updateCurrentUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateById(req.user.id, req.body, req.file);
    res.json(updatedUser);
  } catch (err) {
    console.error('Erreur updateCurrentUser', err);
    res.status(500).json({ message: 'Erreur mise à jour' });
  }
};

module.exports = { register, login, getCurrentUser, updateCurrentUser };