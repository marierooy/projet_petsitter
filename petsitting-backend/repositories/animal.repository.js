const { Animal } = require('../models');

const create = async (data) => {
  return await Animal.create({
    name: data.name,
    gender: data.gender,
    birthDate: data.birthDate,
    description: data.description,
    userId: data.userId,
    animalTypeId: data.animalTypeId
  });
};

const update = async (id, data) => {
  const [updatedRowsCount] = await Animal.update({
    name: data.name,
    gender: data.gender,
    birthDate: data.birthDate,
    description: data.description,
    userId: data.userId,
    animalTypeId: data.animalTypeId
  }, {
    where: { id }
  });

  if (updatedRowsCount === 0) {
    throw new Error(`Aucun animal trouvé avec l'ID ${id}`);
  }

  return await Animal.findByPk(id); // On retourne l'animal mis à jour
};

const deleteById = async (id) => {
  return await Animal.destroy({ where: { id } });
};

module.exports = { create, update, deleteById };