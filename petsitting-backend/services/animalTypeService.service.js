const animalTypeServiceRepository = require('../repositories/animalTypeService.repository');

const getServices = async (animalTypeId) => {
  return await animalTypeServiceRepository.getServicesByAnimalType(animalTypeId);
};

const getServicesAndOccurencesForAllAnimalTypes = async () => {
  return await animalTypeServiceRepository.getServicesAndOccurencesForAllAnimalTypes();
};

const getServicesAndOccurencesByLabel = async (name) => {
  return await animalTypeServiceRepository.getServicesAndOccurencesByAnimalTypeLabel(name);
};

const updateServices = async (animalTypeId, serviceIds) => {
  return await animalTypeServiceRepository.setServicesForAnimalType(animalTypeId, serviceIds);
};

module.exports = {
  getServices,
  updateServices,
  getServicesAndOccurencesForAllAnimalTypes,
  getServicesAndOccurencesByLabel
};