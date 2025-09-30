const request = require('supertest');
const app = require('../app');
const { sequelize, Role, User, AvailabilityType, Availability } = require('../models');
let token;
let availabilityTypeId;
let availabilityId;

describe('Availability & AvailabilityType routes', () => {

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    await Role.bulkCreate([
        { name: 'petsitter' },
        { name: 'owner' }
    ]);

    // Créer un utilisateur test et récupérer le token
    await request(app)
      .post('/api/auth/register')
      .send({
        roles: ['petsitter'],
        first_name: 'Marie',
        last_name: 'Rooy',
        email: 'petsitter@example.com',
        password: 'Motdepasse-123'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'petsitter@example.com', password: 'Motdepasse-123' });

    token = res.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('POST /api/availability-type/new - crée un type de disponibilité', async () => {
    const res = await request(app)
      .post('/api/availability-type/new')
      .set('Authorization', `Bearer ${token}`)
      .send({
        label: 'Garde domicile',
        color: 'blue'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    availabilityTypeId = res.body.id;
  });

  test('GET /api/availability-type - récupère tous les types de disponibilité', async () => {
    const res = await request(app)
      .get('/api/availability-type')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('POST /api/availability - crée une disponibilité', async () => {
    const res = await request(app)
      .post('/api/availability/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        start_date: '2025-09-25',
        end_date: '2025-09-27',
        availabilityTypeId: availabilityTypeId,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    availabilityId = res.body.id;
  });

  test('GET /api/availability - récupère les disponibilités du petsitter', async () => {
    const res = await request(app)
      .get('/api/availability')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].id).toBe(availabilityId);
  });

  test('PUT /api/availability/:id - met à jour une disponibilité', async () => {
    const res = await request(app)
      .put(`/api/availability/${availabilityId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ end_date: '2025-09-28' });

    expect(res.statusCode).toBe(200);
    expect(res.body.end_date.split('T')[0]).toBe('2025-09-28');
  });

  test('DELETE /api/availability/:id - supprime une disponibilité', async () => {
    const res = await request(app)
      .delete(`/api/availability/${availabilityId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

});