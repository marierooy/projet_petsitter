const { sequelize, Availability, AvailabilityType, User } = require('../models');

describe('Validation des données Availability', () => {
  let petsitter, homeCareType;

  beforeAll(async () => {
    // await Availability.destroy({ where: {} });
    // await AvailabilityType.destroy({ where: {} });
    // await User.destroy({ where: {} });

    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    petsitter = await User.create({
      first_name: 'Bob',
      last_name: 'Petsitter',
      email: 'bob@example.com',
      password: 'Motdepasse-123',
    });

    homeCareType = await AvailabilityType.create({ label: 'Home Care', petsitterId: petsitter.id });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('✅ Crée une disponibilité valide', async () => {
    const availability = await Availability.create({
      start_date: '2025-10-01',
      end_date: '2025-10-10',
      petsitterId: petsitter.id,
      availabilityTypeId: homeCareType.id,
    });

    expect(availability).toHaveProperty('id');
    expect(availability.start_date.toISOString().split('T')[0]).toBe('2025-10-01');
    expect(availability.end_date.toISOString().split('T')[0]).toBe('2025-10-10');
  });

  test('❌ Refuse une disponibilité sans petsitter', async () => {
    await expect(
      Availability.create({
        start_date: '2025-10-01',
        end_date: '2025-10-10',
        availabilityTypeId: homeCareType.id,
      })
    ).rejects.toThrow();
  });

  test('❌ Refuse une disponibilité sans type de disponibilité', async () => {
    await expect(
      Availability.create({
        start_date: '2025-10-01',
        end_date: '2025-10-10',
        petsitterId: petsitter.id,
      })
    ).rejects.toThrow();
  });

  test('❌ Refuse une disponibilité avec endDate avant startDate', async () => {
    try {
        await Availability.create({
        start_date: '2025-10-10',
        end_date: '2025-10-01',
        petsitterId: petsitter.id,
        availabilityTypeId: homeCareType.id,
        });
    } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toMatch(/La date de début doit être antérieure ou égale à la date de fin/i);
    }
  });
});