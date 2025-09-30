const { sequelize, Contract, AdvertOfferContract, Offer, User, Role, Animal, AnimalType, CareMode } = require('../models');

describe("Validation et calcul des Contracts", () => {
  let contract, user, petsitter, animalType, animal, careMode, offer;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const [ownerRole, petsitterRole] = await Role.bulkCreate([{ name: 'owner' }, { name: 'petsitter' }], { returning: true });

    user = await User.create({ first_name: "Alice", last_name: "Owner", email: "owner@test.com", password: "123456" });
    petsitter = await User.create({ first_name: "Bob", last_name: "Petsitter", email: "petsitter@test.com", password: "123456" });

    await user.addRole(ownerRole);
    await petsitter.addRole(petsitterRole);

    animalType = await AnimalType.create({ name: "Chien" });
    animal = await Animal.create({ name: "Rex", userId: user.id, animalTypeId: animalType.id });

    careMode = await CareMode.create({ label: "home" });

    offer = await Offer.create({ petsitterId: petsitter.id, animalTypeId: animalType.id, number_animals: 2, offer_price: 20, travel_price: 5 });

  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("✅ Crée un contract avec validations par défaut à false", async () => {
    contract = await Contract.create({ total_price: 0 });
    expect(contract.petsitter_validation).toBe(false);
    expect(contract.owner_validation).toBe(false);
    expect(contract.total_price).toBe(0);
  });

  it("✅ Met à jour les validations", async () => {
    contract.petsitter_validation = true;
    contract.owner_validation = true;
    await contract.save();

    const updated = await Contract.findByPk(contract.id);
    expect(updated.petsitter_validation).toBe(true);
    expect(updated.owner_validation).toBe(true);
  });

  it("❌ Refuse un contract avec total_price négatif", async () => {
    await expect(Contract.create({ total_price: -10 })).rejects.toThrow();
  });
});