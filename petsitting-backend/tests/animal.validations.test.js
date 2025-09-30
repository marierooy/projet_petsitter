const { sequelize, Animal, AnimalType, User } = require('../models');

describe('Validation des données Animal', () => {
  let user, dogType;

  beforeAll(async () => {
    // await Animal.destroy({ where: {}, force: true });      // Enfants
    // await User.destroy({ where: {}, force: true });        // Parents
    // await AnimalType.destroy({ where: {}, force: true });  // Parents

    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    user = await User.create({
      first_name: 'Alice',
      last_name: 'Owner',
      email: 'owner@example.com',
      password: 'Motdepasse-123',
    });

    dogType = await AnimalType.create({ name: 'Dog' });
  });

  afterAll(async () => {
    await Animal.destroy({ where: {}, force: true });
    await AnimalType.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await sequelize.close();
  });

  test('✅ Crée un animal valide', async () => {
    const animal = await Animal.create({
      name: 'Rex',
      gender: 'male',
      birthDate: '2020-05-15',
      description: 'Un gentil chien',
      userId: user.id,
      animalTypeId: dogType.id,
    });

    expect(animal).toHaveProperty('id');
    expect(animal.name).toBe('Rex');
    expect(animal.gender).toBe('male');
    expect(animal.birthDate).toBe('2020-05-15');
  });

  test('❌ Refuse un animal sans nom', async () => {
    await expect(
      Animal.create({
        gender: 'female',
        birthDate: '2021-01-01',
        description: 'Sans nom',
        ownerId: user.id,
        animalTypeId: dogType.id,
      })
    ).rejects.toThrow();
  });

  test('✅ Accepte un animal sans gender ni birthDate ni description', async () => {
    const animal = await Animal.create({
      name: 'Mystery',
      userId: user.id,
      animalTypeId: dogType.id,
    });

    expect(animal).toHaveProperty('id');
    expect(animal.name).toBe('Mystery');
    expect(animal.gender).toBeFalsy();
    expect(animal.birthDate).toBeFalsy();
    expect(animal.description).toBeFalsy();
  });

  test('❌ Refuse un animal sans userId', async () => {
    await expect(
      Animal.create({
        name: 'Orphelin',
        gender: 'male',
        birthDate: '2022-03-10',
        animalTypeId: dogType.id,
      })
    ).rejects.toThrow();
  });

  test('❌ Refuse un animal sans animalTypeId', async () => {
    await expect(
      Animal.create({
        name: 'Inclassable',
        gender: 'female',
        userId: user.id,
      })
    ).rejects.toThrow();
  });
});