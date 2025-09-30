const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app'); // ton express app
const { sequelize, User, Role, Animal, AnimalType, CareMode, Service, Occurence, OfferServiceOccurence, Offer, AvailabilityType, Availability } = require('../models');

let ownerToken, petsitterToken;
let owner, petsitter, animal, careMode, service, occurence;
let offer;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const [petsitterRole, ownerRole] = await Role.bulkCreate([
  { name: 'petsitter' },
  { name: 'owner' }
  ], { returning: true });

  // Création d'un propriétaire
  owner = await User.create({ 
    first_name: 'Alice', last_name: 'Owner', email: 'owner@test.com', password: 'password', roles: ['owner'], address: '10 rue de la procession', postal_code: '92150', city: 'Suresnes', country: 'France' 
  });

  // assigner le rôle owner
  await owner.addRole(ownerRole);

  // Création d'un petsitter
  petsitter = await User.create({ 
    first_name: 'Bob', last_name: 'Petsitter', email: 'petsitter@test.com', password: 'password', roles: ['petsitter'], address: '6 rue Neuve Popincourt', postal_code: '75011', city: 'Paris', country: 'France' 
  });

  await petsitter.addRole(petsitterRole);

  // Générer les JWT
  ownerToken = jwt.sign({ id: owner.id, role: owner.role }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });
  petsitterToken = jwt.sign({ id: petsitter.id, role: petsitter.role }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });

  // Création de son type d'animal associé
  const animalType = await AnimalType.create({
    name: 'Chat',       // Nom du type
  });
  // Création d'un animal pour le propriétaire
  animal = await Animal.create({ name: 'Fido', animalTypeId: animalType.id, userId: owner.id });

  // CareMode
  careMode = await CareMode.create({ label: 'Home Care' });

  // Service + Occurence
  service = await Service.create({ label: 'Walking' });
  occurence = await Occurence.create({ label: 'Daily' });

  // Création d'une disponibilité et offre pour le petsitter
  const availabilityType = await AvailabilityType.create({ label: 'Disponible', petsitterId: petsitter.id });
  const availability = await Availability.create({
    start_date: '2025-09-25',
    end_date: '2025-09-27',
    petsitterId: petsitter.id,
    availabilityTypeId: availabilityType.id
  });

  offer = await Offer.create({
    animalTypeId: animalType.id,
    petsitterId: petsitter.id,
    availabilityId: availability.id,
    number_animals: 1,
    offer_price: 20,
    travel_price: 5
  });

  // Associer CareMode et Service/Occurrence à l'offre
  await offer.setCareModes([careMode]);
  await OfferServiceOccurence.create({
    offerId: offer.id,
    serviceId: service.id,
    occurenceId: occurence.id,
    checked: true,  
    price: 10             // si tu veux définir un prix
    });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Matching Propriétaire ↔ Petsitter', () => {

  test('POST /api/matching - renvoie les offres compatibles avec l\'advert', async () => {
    const res = await request(app)
      .post('/api/matching')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        startDate: '2025-09-25',
        endDate: '2025-09-27',
        animalId: animal.id,
        careModeId: careMode.id,
        userId: owner.id,
        services: [{ serviceId: service.id, occurrenceId: occurence.id }],
        numberAnimalsPerType: 1,
      });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const matchedOffer = res.body[0];
    expect(matchedOffer.id).toBe(petsitter.id);
    expect(matchedOffer.syntheticOffer.offer_price).toBe(20);

    const careModeLabels = Object.keys(matchedOffer.syntheticOffer.careModes);
    expect(careModeLabels).toEqual(expect.arrayContaining([careMode.label]));       
    expect(matchedOffer.syntheticOffer.offerServiceOccurences).toEqual(
        expect.arrayContaining([{ serviceId: service.id, occurenceId: occurence.id, checked: true, price: 10 }])
    );
  });

});