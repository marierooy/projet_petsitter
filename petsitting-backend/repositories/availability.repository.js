const { Availability } = require('../models');

async function findAllByPetsitter(petsitterId) {
  return await Availability.findAll({
    where: { petsitterId },
    order: [['start_date', 'ASC']]
  });
}

const createAvailability = async (data) => {
  return await Availability.create(data);
};

const updateAvailability = async (id, data) => {
  const availability = await Availability.findByPk(id);
  if (!availability) return null;
  return await availability.update(data);
};

const deleteAvailability = async (id) => {
  const availability = await Availability.findByPk(id);
  if (!availability) return null;
  return await availability.destroy();
};

const findAvailabilityById = async (id) => {
  return await Availability.findByPk(id);
};

module.exports = {
  createAvailability,
  updateAvailability,
  deleteAvailability,
  findAvailabilityById,
  findAllByPetsitter
};