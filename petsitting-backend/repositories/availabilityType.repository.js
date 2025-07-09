const { AvailabilityType } = require('../models');

const createAvailabilityType = async (data, petsitterId) => {
  return await AvailabilityType.create({
    ...data,
    petsitterId: petsitterId,
  });
};

const updateAvailabilityType = async (id, updates) => {
  return await AvailabilityType.update(updates, { where: { id } });
};

const deleteAvailabilityType = async (id) => {
  return await AvailabilityType.destroy({ where: { id } });
};

const getByPetsitterId = async (petsitterId) => {
  return await AvailabilityType.findAll({ where: { petsitterId } });
};

module.exports = {
  createAvailabilityType,
  updateAvailabilityType,
  deleteAvailabilityType,
  getByPetsitterId
};