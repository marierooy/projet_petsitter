const bcrypt = require('bcryptjs');
const { sequelize, User, Role } = require('../models');
const authService = require('../services/user.service'); // exemple d’un service dédié à register/login

describe('Auth Service - Inscription & Authentification', () => {
  let ownerRole, petsitterRole;

  beforeAll(async () => {
    // await User.destroy({ where: {} });
    // await Role.destroy({ where: {} });

    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    [ownerRole, petsitterRole] = await Role.bulkCreate(
      [{ name: 'owner' }, { name: 'petsitter' }],
      { returning: true }
    );
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('❌ Refuse un email invalide', async () => {
    await expect(
      authService.register({
        first_name: 'John',
        last_name: 'Doe',
        email: 'invalidEmail',
        password: 'Motdepasse-123',
        role: 'owner',
      })
    ).rejects.toThrow('Email invalide');
  });

  test('❌ Refuse un mot de passe trop faible', async () => {
    await expect(
      authService.register({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: '123',
        roles: ['owner'],
      })
    ).rejects.toThrow('Mot de passe invalide');
  });

  test('✅ Inscription avec hashage du mot de passe', async () => {
    const user = await authService.register({
      first_name: 'Alice',
      last_name: 'Owner',
      email: 'alice@example.com',
      password: 'Motdepasse-123',
      roles: ['owner'],
    });

    expect(user).toHaveProperty('id');
    expect(user.email).toBe('alice@example.com');

    // Vérifie que le mot de passe est hashé
    expect(user.password).not.toBe('Motdepasse-123');
    expect(await bcrypt.compare('Motdepasse-123', user.password)).toBe(true);
  });

  test('✅ Attribue le rôle "petsitter"', async () => {
    const user = await authService.register({
      first_name: 'Bob',
      last_name: 'Petsitter',
      email: 'bob@example.com',
      password: 'Motdepasse-123',
      roles: ['petsitter'],
    });

    const roles = await user.getRoles();
    expect(roles.map(r => r.name)).toContain('petsitter');
  });

  test('❌ Refuse un email déjà existant', async () => {
    await expect(
      authService.register({
        first_name: 'Alice',
        last_name: 'Dup',
        email: 'alice@example.com',
        password: 'Motdepasse-123',
        roles: ['owner'],
      })
    ).rejects.toThrow('Email déjà utilisé');
  });
});
