const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepo = require('../repositories/user.repository');
const { Role } = require('../models');
require('dotenv').config();

const register = async (userData) => {
  // Vérifier email existant
  const existing = await userRepo.findByEmail(userData.email);
  if (existing) throw new Error('Email déjà utilisé');

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  userData.password = hashedPassword;

  // Extraire roles si fournis, et supprimer du userData pour éviter erreur createUser
  const rolesToAdd = userData.roles || [];
  delete userData.roles;

  // Créer l'utilisateur sans les rôles
  const user = await userRepo.createUser(userData);

  // Récupérer les rôles demandés en base
  const roles = await Role.findAll({
    where: {
      name: rolesToAdd
    }
  });

  // Lier les rôles à l'utilisateur
  await user.addRoles(roles);

  // Retourner utilisateur (tu peux recharger avec les rôles si tu veux)
  return await userRepo.findByIdWithRoles(user.id);
};

const login = async (email, password) => {
  const user = await userRepo.findByEmailWithRoles(email);
  if (!user) throw new Error('Utilisateur non trouvé');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Mot de passe incorrect');

  const token = jwt.sign({ id: user.id, roles: user.Roles.map(role => role.name) }, process.env.JWT_SECRET, { expiresIn: '2h' });

  return { user, token };
};

const getById = async (id) => {
  return await userRepo.findById(id);
};

const updateById = async (id, body, file) => {
  const sanitizeNumber = (value) => {
    return value === '' || value === undefined || value === null ? null : Number(value);
  };

  // Nettoyage avant parseFields
  const cleanedData = {
    ...body,
    number_children: sanitizeNumber(body.number_children),
    number_rooms: sanitizeNumber(body.number_rooms),
    habitation_size: sanitizeNumber(body.habitation_size),
    garden_size: sanitizeNumber(body.garden_size),
  };
  
  const data = {
    ...parseFields(cleanedData),
    photo: file ? `/uploads/${file.filename}` : undefined,
  };

  return await userRepo.updateById(id, data);
};

// Pour parser les champs JSON envoyés depuis le front
function parseFields(body) {
  const parsed = {};
  for (const [key, value] of Object.entries(body)) {
    try {
      parsed[key] = JSON.parse(value);
    } catch {
      parsed[key] = value;
    }
  }
  return parsed;
}

module.exports = { register, login, getById, updateById };