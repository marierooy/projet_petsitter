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

const findById = async (id) => {
  return await User.findByPk(id, { attributes: { exclude: ['password'] }, include: Role });
};

const updateById = async (id, data) => {
  const rolesLabels = data.roles;
  delete data.roles;

  // Mise à jour des champs simples
  await User.update(data, { where: { id } });

  const user = await User.findByPk(id);
  if (!user) throw new Error('Utilisateur non trouvé');

  if (rolesLabels) {
    // Trouver les rôles par leurs labels pour récupérer les IDs
    const roles = await Role.findAll({
      where: {
        name: rolesLabels // labels comme ['petsitter', 'admin']
      }
    });
    const roleIds = roles.map(role => role.id);

    // Mettre à jour les rôles par leurs IDs
    await user.setRoles(roleIds);
  }

  const updatedUser = await User.findByPk(id, {
    attributes: { exclude: ['password'] },
    include: [
      {
        model: Role,
        through: { attributes: [] }
      }
    ]
  });

  return updatedUser;
};

module.exports = {
  createUser,
  findByEmail,
  findByIdWithRoles,
  findById,
  addRoleToUser,
  getUserRoles,
  findByEmailWithRoles,
  updateById
};