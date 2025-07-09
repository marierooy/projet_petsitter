const animalTypeRepo = require('../repositories/animalType.repository');

const getAll = async () => {
  return await animalTypeRepo.findAll();
};

module.exports = { getAll };
