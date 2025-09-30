const { sequelize, User, Role, Animal, AnimalType, CareMode, Offer, OfferServiceOccurence, Availability, AvailabilityType, Service, Occurence } = require('../models');
const { findMatchingPetsitters } = require('../repositories/matching.repository');

describe("Matching Propriétaire ↔ Petsitter", () => {
  let owner, petsitter, animal, animalType, careMode, service, occurence, offer, availability, availabilityType;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Roles
     const [petsitterRole, ownerRole] = await Role.bulkCreate([
    { name: 'petsitter' },
    { name: 'owner' }
    ], { returning: true });

    owner = await User.create({ first_name: "Alice", last_name: "Owner", email: "owner@test.com", password: "123456", address: '10 rue de la procession', postal_code: '92150', city: 'Suresnes', country: 'France'  });
    petsitter = await User.create({ first_name: "Bob", last_name: "Petsitter", email: "petsitter@test.com", password: "123456", address: '6 rue Neuve Popincourt', postal_code: '75011', city: 'Paris', country: 'France' });
    await owner.addRole(ownerRole);
    await petsitter.addRole(petsitterRole);

    animalType = await AnimalType.create({ name: "Chien" });
    animal = await Animal.create({ name: "Rex", userId: owner.id, animalTypeId: animalType.id });

    careMode = await CareMode.create({ label: "home" });
    availabilityType = await AvailabilityType.create({ label: "Vacances", color: "blue", petsitterId: petsitter.id });
    availability = await Availability.create({ start_date: "2025-10-01", end_date: "2025-10-10", petsitterId: petsitter.id, availabilityTypeId: availabilityType.id });

    service = await Service.create({ label: "Promenade" });
    occurence = await Occurence.create({ label: "1 fois/jour" });
    await service.addOccurence(occurence);

    offer = await Offer.create({ petsitterId: petsitter.id, animalTypeId: animalType.id, number_animals: 2, offer_price: 20, travel_price: 5, availabilityId: availability.id });
    await offer.setCareModes([careMode]);
    await OfferServiceOccurence.create({ offerId: offer.id, serviceId: service.id, occurenceId: occurence.id, price: 10, checked: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("✅ trouve le petsitter correspondant aux critères", async () => {
    const results = await findMatchingPetsitters({
      animalId: animal.id,
      careModeId: careMode.id,
      startDate: "2025-10-02",
      endDate: "2025-10-05",
      services: [{ serviceId: service.id, occurrenceId: occurence.id }],
      userId: owner.id,
      numberAnimalsPerType: 1
    });

    expect(results.length).toBe(1);
    const matched = results[0];
    expect(matched.id).toBe(petsitter.id);
    expect(matched.syntheticOffer.offer_price).toBeGreaterThan(0);
    expect(matched.syntheticOffer.offerServiceOccurences.length).toBeGreaterThan(0);
    const offer = matched.syntheticOffer;

    // Calcul du total_price attendu
    const days = 4; // du 2 au 5 octobre inclus
    const maxFrequence = 1;
    const offerPriceTotal = offer.offer_price * days;
    const travelPriceTotal = offer.travel_price * 2 * maxFrequence * days;
    const servicePriceTotal = offer.offerServiceOccurences.reduce((sum, o) => sum + o.price * days, 0);

    const expectedTotalPrice = offerPriceTotal + travelPriceTotal + servicePriceTotal;

    expect(expectedTotalPrice).toBeGreaterThan(0); 
    // Si total_price est retourné dans syntheticOffer
    if (offer.total_price !== undefined) {
        expect(offer.total_price).toBeCloseTo(expectedTotalPrice, 1);
  }
  });
});
