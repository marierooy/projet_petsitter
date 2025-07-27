const availabilityRepo = require('../repositories/availability.repository');

async function getAllAvailabilitiesByPetsitter(petsitterId) {
  return await availabilityRepo.findAllByPetsitter(petsitterId);
}

const create = async (userId, data) => {
  return await availabilityRepo.createAvailability(userId, data);
};

const update = async (id, userId, data) => {
  const availability = await availabilityRepo.findAvailabilityById(id);
  if (!availability || availability.petsitterId !== userId) return null;
  return await availabilityRepo.updateAvailability(id, data);
};

const remove = async (id, userId) => {
  const availability = await availabilityRepo.findAvailabilityById(id);
  if (!availability || availability.petsitterId !== userId) return null;
  return await availabilityRepo.deleteAvailability(id);
};

module.exports = {
  create,
  update,
  remove,
  getAllAvailabilitiesByPetsitter
};