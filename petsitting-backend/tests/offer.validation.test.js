const { sequelize, Offer, AnimalType, User, Service, Occurence, OfferServiceOccurence } = require('../models');
const { updateRawOfferServicesAndOccurrences, updateOfferServicesAndOccurrences } = require('../repositories/offer.repository');

describe("Validation des données Offer", () => {
  let user, animalType, service, occurence, offerId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Création d'un utilisateur
    user = await User.create({
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      password: "Hashedpassword-123"
    });

    // Création d'un type d'animal
    animalType = await AnimalType.create({ name: "Chien" });

    // Création d'un service et d'une occurrence
    service = await Service.create({ label: "Promenade" });
    occurence = await Occurence.create({ label: "Quotidienne" });

    // Associer l'occurrence au service
    await service.addOccurence(occurence);

    // Création d'une offer de base
    const offer = await Offer.create({
      petsitterId: user.id,
      animalTypeId: animalType.id,
      offer_price: 20,
      travel_price: 5,
    });
    offerId = offer.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Nettoyer les offerServiceOccurences avant chaque test
    await OfferServiceOccurence.destroy({ where: { offerId } });
  });

  // --- Prix ---
  it("❌ Refuse une offer sans prix", async () => {
    await expect(
      Offer.create({
        petsitterId: user.id,
        animalTypeId: animalType.id,
        offer_price: null
      })
    ).rejects.toThrow();
  });

  it("❌ Refuse une offer avec prix négatif", async () => {
    await expect(
      Offer.create({
        petsitterId: user.id,
        animalTypeId: animalType.id,
        offer_price: -10
      })
    ).rejects.toThrow();
  });

  it("✅ Accepte une offer avec travel_price null", async () => {
    const offer = await Offer.create({
      petsitterId: user.id,
      animalTypeId: animalType.id,
      offer_price: 20,
      travel_price: null
    });
    expect(offer).toHaveProperty("id");
  });

  it("❌ Refuse une offer avec travel_price négatif", async () => {
    await expect(
      Offer.create({
        petsitterId: user.id,
        animalTypeId: animalType.id,
        offer_price: 20,
        travel_price: -5
      })
    ).rejects.toThrow();
  });

  // --- Services / Occurrences ---
  describe('updateRawOfferServicesAndOccurrences', () => {
    it('❌ Refuse si aucun service', async () => {
      await expect(updateRawOfferServicesAndOccurrences(offerId, []))
        .rejects
        .toThrow('L’offre doit avoir au moins un service associé');
    });

    it('❌ Refuse si service sans occurrence cochée', async () => {
      const services = [
        { serviceId: service.id, occurenceId: occurence.id, checked: false, price: 10 },
      ];
      await expect(updateRawOfferServicesAndOccurrences(offerId, services))
        .rejects
        .toThrow(/doit avoir au moins une occurrence cochée/);
    });

    it('✅ Accepte service avec occurrence cochée', async () => {
      const services = [
        { serviceId: service.id, occurenceId: occurence.id, checked: true, price: 10 },
      ];
      await updateRawOfferServicesAndOccurrences(offerId, services);

      const saved = await OfferServiceOccurence.findAll({ where: { offerId } });
      expect(saved.length).toBe(1);
      expect(saved[0].checked).toBe(true);
    });
  });

  describe('updateOfferServicesAndOccurrences', () => {
    it('❌ Refuse si aucun service', async () => {
      await expect(updateOfferServicesAndOccurrences(offerId, []))
        .rejects
        .toThrow('L’offre doit avoir au moins un service associé');
    });

    it('❌ Refuse si service sans occurrence cochée', async () => {
      const services = [
        { id: service.id, occurences: [{ id: occurence.id, checked: false, price: 10 }] },
      ];
      await expect(updateOfferServicesAndOccurrences(offerId, services))
        .rejects
        .toThrow(/doit avoir au moins une occurrence cochée/);
    });

    it('✅ Accepte service avec occurrence cochée', async () => {
      const services = [
        { id: service.id, occurences: [{ id: occurence.id, checked: true, price: 10 }] },
      ];
      await updateOfferServicesAndOccurrences(offerId, services);

      const saved = await OfferServiceOccurence.findAll({ where: { offerId } });
      expect(saved.length).toBe(1);
      expect(saved[0].checked).toBe(true);
    });
  });
});