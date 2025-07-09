const animalTypeService = require('../services/animalType.service');

const getAllAnimalTypes = async (req, res) => {
  try {
    const types = await animalTypeService.getAll();
    res.status(200).json(types);
  } catch (error) {
    console.error('Erreur dans getAllAnimalTypes:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = { getAllAnimalTypes };
