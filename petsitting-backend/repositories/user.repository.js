const { User, Role } = require('../models');

// Crée un utilisateur simple (sans rôle ici)
const createUser = (userData) => User.create(userData);

// Recherche un utilisateur par email
const findByEmail = (email) =>
  User.findOne({ where: { email } });

const findByEmailWithRoles = (email) =>
  User.findOne({ where: { email }, include: Role });

// Recherche un utilisateur avec ses rôles associés
const findByIdWithRoles = (userId) =>
  User.findByPk(userId, { include: Role });

const findById = async (id) => {
  return await User.findByPk(id);
};

// Ajoute un rôle à un utilisateur
const addRoleToUser = async (userId, roleName) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) throw new Error("Role not found");

  await user.addRole(role); // Sequelize crée automatiquement la relation dans user_roles
};

// Récupère les rôles d'un utilisateur
const getUserRoles = async (userId) => {
  const user = await User.findByPk(userId, { include: Role });
  if (!user) throw new Error("User not found");

  return user.roles.map(r => r.name);
};

module.exports = {
  createUser,
  findByEmail,
  findByIdWithRoles,
  findById,
  addRoleToUser,
  getUserRoles,
  findByEmailWithRoles
};