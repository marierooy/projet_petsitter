const {
  sequelize,
  User,
  Role,
  Animal,
  AnimalType,
  CareMode,
  Service,
  Occurence,
  Advert,
  AdvertServiceOccurence
} = require('../models');

const { createAdvert } = require('../services/advert.service');

describe("Validation & logique métier Advert", () => {
  let user, animal, careMode, service, occurence;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Créer un propriétaire
    const role = await Role.create({ name: "owner" });
    user = await User.create({
      first_name: "Léo",
      last_name: "Martin",
      email: "owner@example.com",
      password: "Motdepasse-123"
    });
    await user.setRoles([role.id]);

    const animalType = await AnimalType.create({ name: "Chien" });

    // Créer un animal
    animal = await Animal.create({ name: "Rex", userId: user.id, animalTypeId: animalType.id });

    // Créer un mode de garde
    careMode = await CareMode.create({ label: "Chez le petsitter" });

    // Créer Service & Occurrence
    service = await Service.create({ label: "Promenade" });
    occurence = await Occurence.create({ label: "2 fois/jour" });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // --- Validation dates ---
  it("❌ Refuse si endDate < startDate", async () => {
    await expect(
      Advert.create({
        startDate: "2025-10-05",
        endDate: "2025-10-01",
        userId: user.id,
        animalId: animal.id,
        careModeId: careMode.id
      })
    ).rejects.toThrow();
  });

  it("❌ Refuse si startDate ou endDate manquant", async () => {
    await expect(
      Advert.create({
        endDate: "2025-10-05",
        userId: user.id,
        animalId: animal.id,
        careModeId: careMode.id
      })
    ).rejects.toThrow();

    await expect(
      Advert.create({
        startDate: "2025-10-01",
        userId: user.id,
        animalId: animal.id,
        careModeId: careMode.id
      })
    ).rejects.toThrow();
  });

  // --- Validation careMode & animal ---
  it("❌ Refuse si careModeId manquant", async () => {
    await expect(
      Advert.create({
        startDate: "2025-10-01",
        endDate: "2025-10-05",
        userId: user.id,
        animalId: animal.id
      })
    ).rejects.toThrow();
  });

  it("❌ Refuse si animalId manquant", async () => {
    await expect(
      Advert.create({
        startDate: "2025-10-01",
        endDate: "2025-10-05",
        userId: user.id,
        careModeId: careMode.id
      })
    ).rejects.toThrow();
  });

  // --- Validation services/occurrences ---
  describe("createAdvert (logique métier)", () => {
    it("❌ Refuse si aucun service/occurrence fourni", async () => {
      await expect(
        createAdvert({
          startDate: "2025-10-01",
          endDate: "2025-10-05",
          userId: user.id,
          animalId: animal.id,
          careModeId: careMode.id,
          services: []
        })
      ).rejects.toThrow("Un advert doit avoir au moins un couple service/occurrence associé à l'animal");
    });

    it("❌ Refuse si service sans occurrence", async () => {
      await expect(
        createAdvert({
          startDate: "2025-10-01",
          endDate: "2025-10-05",
          userId: user.id,
          animalId: animal.id,
          careModeId: careMode.id,
          services: [{ serviceId: service.id }] // manque occurrenceId
        })
      ).rejects.toThrow("Chaque service doit être associé à une occurrence valide");
    });

    it("✅ Accepte un advert avec au moins un couple service/occurrence", async () => {
      const advert = await createAdvert({
        startDate: "2025-10-01",
        endDate: "2025-10-05",
        userId: user.id,
        animalId: animal.id,
        careModeId: careMode.id,
        services: [{ serviceId: service.id, occurrenceId: occurence.id }]
      });

      const linked = await AdvertServiceOccurence.findAll({ where: { advertId: advert.id } });
      expect(linked.length).toBe(1);
      expect(linked[0].serviceId).toBe(service.id);
      expect(linked[0].occurenceId).toBe(occurence.id);
    });
  });
});