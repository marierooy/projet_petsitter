const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { sequelize, User, Role, Contract, Offer, Animal, AnimalType, OfferServiceOccurence, Service, Occurence, CareMode, Advert, AdvertServiceOccurence, AdvertOfferContract } = require('../models');
let token, owner, petsitter, offer, service, occurence, contract, careMode, animal, advert, oso, petsitterToken, ownerToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  // Création des utilisateurs et rôles
  const [petsitterRole, ownerRole] = await Role.bulkCreate([{ name: 'petsitter' }, { name: 'owner' }], { returning: true });
  owner = await User.create({ first_name: 'Alice', last_name: 'Owner', email: 'owner@test.com', password: 'Motdepasse-123' });
  petsitter = await User.create({ first_name: 'Bob', last_name: 'Petsitter', email: 'petsitter@test.com', password: 'Motdepasse-123' });
  await owner.addRole(ownerRole);
  await petsitter.addRole(petsitterRole);

  // Auth token
  ownerToken = jwt.sign({ id: owner.id, roles: owner.Roles }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });
  petsitterToken = jwt.sign({ id: petsitter.id, roles: petsitter.Roles }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });

  // Création careMode, service, occurence
  careMode = await CareMode.create({ label: 'Home Care' });
  service = await Service.create({ label: 'Grooming' });
  occurence = await Occurence.create({ label: 'Daily' });

  // AnimalType et Animal
  const animalType = await AnimalType.create({ name: 'Chat' });
  animal = await Animal.create({ name: 'Mimi', userId: owner.id, animalTypeId: animalType.id });

  // Advert
  advert = await Advert.create({
    startDate: '2025-09-25',
    endDate: '2025-09-27',
    userId: owner.id,
    animalId: animal.id,
    careModeId: careMode.id
  });
  await AdvertServiceOccurence.create({ advertId: advert.id, serviceId: service.id, occurenceId: occurence.id, price: 10 });

  // Offre
  offer = await Offer.create({
    animalTypeId: animalType.id,
    petsitterId: petsitter.id,
    number_animals: 2,
    offer_price: 20,
    travel_price: 5
  });
  await offer.setCareModes([careMode]);
  oso = await OfferServiceOccurence.create({ offerId: offer.id, serviceId: service.id, occurenceId: occurence.id, price: 10, checked: true });
});

afterAll(async () => {
  await AdvertOfferContract.destroy({ where: {} });
  await Contract.destroy({ where: {} });

  await OfferServiceOccurence.destroy({ where: {} });
  await Offer.destroy({ where: {} });

  await AdvertServiceOccurence.destroy({ where: {} });
  await Advert.destroy({ where: {} });

  await Service.destroy({ where: {} });
  await Occurence.destroy({ where: {} });
  await CareMode.destroy({ where: {} });

  await Role.destroy({ where: {} });
  await User.destroy({ where: {} });
});

describe('Contracts Integration via POST, PUT, DELETE', () => {

  test('Créer un contrat via POST /contract', async () => {
    const petsitterPayload = {
      id: petsitter.id,
      total_allAnimals_price: 50,
      syntheticOffers: [{ animalId: animal.id, syntheticOffer: { offerId: offer.id } }]
    };

    const res = await request(app)
      .post('/api/contract')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        ownerId: owner.id,
        petsitter: petsitterPayload,
        requestData: [{ animalId: animal.id, advertId: advert.id }]
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    contract = res.body;
  });

  test('Valider un contrat via POST /contract/:id/validate', async () => {
    const res = await request(app)
      .post(`/api/contract/${contract.id}/validate`)
      .set('Authorization', `Bearer ${petsitterToken}`)

    expect(res.statusCode).toBe(200);
    expect(res.body.owner_validation).toBe(true);
    expect(res.body.petsitter_validation).toBe(true);
  });

  test('Supprimer un contrat via DELETE /contract/:id', async () => {
    const res = await request(app)
      .delete(`/api/contract/${contract.id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Contrat supprimé');

    // Vérifier que le contrat a bien été supprimé en base
    const deleted = await Contract.findByPk(contract.id);
    expect(deleted).toBeNull();
  });

});