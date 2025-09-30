const request = require('supertest');
const app = require('../app');
const { sequelize, User, Animal, AnimalType, CareMode, Service, Occurence, Advert, AdvertUserAnimal, AdvertServiceOccurence } = require('../models');
const jwt = require('jsonwebtoken');

let token;
let userId, animalId, careModeId, serviceId, occurenceId, advertId, asoId, services;

describe('Adverts Integration Tests', () => {

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Créer un utilisateur
    const user = await User.create({
      first_name: 'Alice',
      last_name: 'Dupont',
      email: 'alice@example.com',
      password: 'Password123'
    });
    userId = user.id;

    token = jwt.sign({ id: user.id, roles: ['owner'] }, process.env.JWT_SECRET, { expiresIn: '2h' });

    const animalType = await AnimalType.create({ name: 'Dog' });

    // Créer un animal pour l'utilisateur
    const animal = await Animal.create({ name: 'Fido', userId: userId, animalTypeId: animalType.id });
    animalId = animal.id;

    // Créer CareMode
    const careMode = await CareMode.create({ label: 'Domicile' });
    careModeId = careMode.id;

    // Créer Service et Occurence
    const service = await Service.create({ label: 'Promenade' });
    serviceId = service.id;

    const occurence = await Occurence.create({ label: '1 fois/jour' });
    occurenceId = occurence.id;

    services = [{ serviceId: serviceId, occurrenceId: occurenceId }];
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('POST /api/advert - crée un advert', async () => {
    const res = await request(app)
      .post('/api/advert')
      .set('Authorization', `Bearer ${token}`)
      .send({
            startDate: '2025-10-01',
            endDate: '2025-10-05',
            userId,
            animalId,
            careModeId,
            services
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    advertId = res.body.id;
  });

  test('GET /api/advert/recent - récupère les adverts récents', async () => {
    const res = await request(app)
      .get('/api/advert/recent')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(a => a.id === advertId)).toBe(true);
  });

  test('DELETE /api/advert/:id - supprime l’advert', async () => {
    const res = await request(app)
      .delete(`/api/advert/${advertId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Annonce supprimée avec succès.');

    const advert = await Advert.findByPk(advertId);
    expect(advert).toBeNull();
  });

});