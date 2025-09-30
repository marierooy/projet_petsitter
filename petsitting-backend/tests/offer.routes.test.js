const request = require('supertest');
const app = require('../app');
const { sequelize, User, Offer, Role, AnimalType, Availability, AvailabilityType, Service, Occurence, OfferServiceOccurence } = require('../models');
const jwt = require('jsonwebtoken');

let token;
let petsitterId;
let offerId;
let animalTypeId;
let availabilityId;
let serviceId;
let occurenceId;
let osoId;

describe('CRUD Offers & OfferServiceOccurence', () => {

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const role = await Role.create({ name: 'petsitter' });

    // Créer un petsitter
    const user = await User.create({
      first_name: 'Marie',
      last_name: 'Rooy',
      email: 'petsitter@example.com',
      password: 'Motdepasse-123'
    });
    await user.setRoles([1]);
    petsitterId = user.id;

    token = jwt.sign({ id: user.id, roles: ['petsitter'] }, process.env.JWT_SECRET, { expiresIn: '2h' });

    // Créer un AnimalType
    const at = await AnimalType.create({ name: 'Petit chien (<9 kg)' });
    animalTypeId = at.id;

    // Créer un type de disponibilité
    const availabilityType = await AvailabilityType.create({
        label: 'Vacances',
        color: 'blue',
        petsitterId: petsitterId,
    });

    // Créer une disponibilité
    const availability = await Availability.create({
      start_date: '2025-09-25',
      end_date: '2025-09-27',
      petsitterId: petsitterId,
      availabilityTypeId: availabilityType.id
    });
    availabilityId = availability.id;

    // Créer Service et Occurence
    const service = await Service.create({ label: 'Promenade' });
    serviceId = service.id;
    const occurence = await Occurence.create({ label: '1 fois/jour' });
    occurenceId = occurence.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('POST /api/offer/synthetic/:petsitterId - crée des offres synthétiques', async () => {
    const res = await request(app)
      .post(`/api/offer/synthetic/${petsitterId}`)
      .set('Authorization', `Bearer ${token}`)
      .send([
        {
            animalId: 1,
            syntheticOffer: {
            animalTypeId,
            availabilityData: { start_date: '2025-09-25', end_date: '2025-09-27' },
            careModes: [],
            offer_price: 20,
            travel_price: 5,
            number_animals: 1,
            offerServiceOccurences: [
            {
            serviceId,
            occurenceId,
            price: 10,
            checked: true,   // ✅ au moins une occurrence cochée
            },
            ],
            }
        }
    ]);

    expect(res.statusCode).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    offerId = res.body[0].id;
  });

  test('PUT /api/offer/bulk - mise à jour multiple des offres', async () => {
    const res = await request(app)
      .put('/api/offer/bulk')
      .set('Authorization', `Bearer ${token}`)
      .send([
        { id: offerId, animalTypeId, availabilityId, number_animals: 2, offer_price: 50, travel_price: 10, offerServiceOccurences: [{ serviceId, occurenceId, price: 10, checked: true }], }
      ]);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Toutes les offres ont été enregistrées.');
  });

});