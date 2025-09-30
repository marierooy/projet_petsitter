const request = require('supertest');
const app = require('../app');
const { sequelize, User, AnimalType, Animal } = require('../models');
const jwt = require('jsonwebtoken');

let token;
let userId;
let animalTypeId;
let animalId;

beforeAll(async () => {
  // Connexion à la BDD test et synchronisation
  await sequelize.authenticate();
  await sequelize.sync({ force: true });

  // Création d'un utilisateur test
  const user = await User.create({
    roles: ['owner'],
    first_name: 'Test',
    last_name: 'User',
    email: 'testuser@example.com',
    password: 'Motdepasse-123' // assure-toi que ton hashage est compatible
  });
  userId = user.id;

  // Génération du token JWT pour bypasser le middleware
  token = jwt.sign(
    { id: user.id, roles: user.roles, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Création d'un type d'animal pour les tests
  const animalType = await AnimalType.create({ name: 'Chien' });
  animalTypeId = animalType.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('CRUD Animaux', () => {
  test('POST /api/animal/add - crée un animal avec succès', async () => {
    const res = await request(app)
      .post('/api/animal/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Rex',
        gender: 'male',
        birthDate: '2020-01-01',
        description: 'Un chien très gentil',
        animalTypeId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Rex');
    animalId = res.body.id;
  });

  test('GET /api/animal - récupère les animaux de l’utilisateur', async () => {
    const res = await request(app)
      .get('/api/animal')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].name).toBe('Rex');
  });

  test('PUT /api/animal/:id/edit - met à jour un animal', async () => {
    const res = await request(app)
      .put(`/api/animal/${animalId}/edit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Rex modifié' });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Rex modifié');
  });

  test('DELETE /api/animal/:id/delete - supprime un animal', async () => {
    const res = await request(app)
      .delete(`/api/animal/${animalId}/delete`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(204);

    // Vérification que l’animal a été supprimé
    const deleted = await Animal.findByPk(animalId);
    expect(deleted).toBeNull();
  });
});