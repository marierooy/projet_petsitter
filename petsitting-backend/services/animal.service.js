const animalRepo = require('../repositories/animal.repository');
const userRepo = require('../repositories/user.repository');
const animalTypeServiceRepo = require('../repositories/animalTypeService.repository');
const { AnimalType, Animal } = require('../models');

const createAnimal = async (data) => {
  // Vérifie si l'utilisateur existe
  const user = await userRepo.findById(data.userId);
  if (!user) throw new Error("Utilisateur non trouvé");

  // Vérifie si le type d'animal existe
  const animalType = await AnimalType.findByPk(data.animalTypeId);
  if (!animalType) throw new Error("Type d'animal invalide");

  // Crée l’animal
  return await animalRepo.create(data);
};

const getAnimalsByUser = async (userId) => {
  return Animal.findAll({
    where: { userId },
    include: ['animalType']
  });
};

const updateAnimal = async (id, data) => {
  const updated = await animalRepo.update(id, data);
  return updated;
};

const deleteAnimal = async (id) => {
  const deletedCount = await animalRepo.deleteById(id);
  if (deletedCount === 0) {
    throw new Error(`Aucun animal trouvé avec l'id ${id}`);
  }
  return deletedCount;
};


const getAnimalsWithServicesByUserId = async (userId) => {
  const animals = await animalRepo.findAnimalsWithTypeByUserId(userId);
  if (!animals || animals.length === 0) return [];

  const results = [];

  for (const animal of animals) {
    const { allServices, services } = await animalTypeServiceRepo.getServicesAndOccurencesByAnimalType(animal.animalType.id);

    const animalJson = animal.toJSON();
    animalJson.allServices = allServices;
    animalJson.services = services;

    results.push(animalJson);
  }

  return results;
};

module.exports = { createAnimal, getAnimalsByUser, updateAnimal, deleteAnimal, getAnimalsWithServicesByUserId };