const animalService = require('../services/animal.service');

const createAnimal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, gender, birthDate, description, animalTypeId } = req.body;

    const animal = await animalService.createAnimal({
      name,
      gender,
      birthDate,
      description,
      animalTypeId,
      userId
    });
    res.status(201).json(animal);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAnimalsByUser = async (req, res) => {
  try {
    const animals = await animalService.getAnimalsByUser(req.user.id);
    res.json(animals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAnimal = async (req, res) => {
  const animalId = req.params.id;
  const data = req.body;
  try {
    const updatedAnimal = await animalService.updateAnimal(animalId, data);
    res.status(200).json(updatedAnimal);
  } catch (err) {
    console.error('Erreur controller updateAnimal :', err);
    res.status(500).json({ error: 'Erreur lors de la modification de l’animal' });
  }
};

const deleteAnimal = async (req, res) => {
  const { id } = req.params;

  try {
    await animalService.deleteAnimal(id);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erreur suppression animal :', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createAnimal, getAnimalsByUser, updateAnimal, deleteAnimal };