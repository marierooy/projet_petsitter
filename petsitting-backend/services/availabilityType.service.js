const repo = require('../repositories/availabilityType.repository');

const create = async (data, petsitterId) => repo.createAvailabilityType(data, petsitterId);
const update = async (id, updates) => repo.updateAvailabilityType(id, updates);
const remove = async (id) => repo.deleteAvailabilityType(id);
const listByPetsitter = async (petsitterId) => repo.getByPetsitterId(petsitterId);

module.exports = { create, update, remove, listByPetsitter };