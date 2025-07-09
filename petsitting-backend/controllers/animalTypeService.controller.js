const animalTypeService = require('../services/animalTypeService.service');

const getServicesForAnimalType = async (req, res) => {
  const { id } = req.params;

  try {
    const services = await animalTypeService.getServices(id);
    res.json(services);
  } catch (err) {
    console.error('Erreur lors de la récupération des services :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getServicesAndOccurencesForAllAnimalTypes = async (req, res) => {
  try {
    const animalTypes = await animalTypeService.getServicesAndOccurencesForAllAnimalTypes();
    res.json(animalTypes);
  } catch (err) {
    console.error('Erreur lors de la récupération des services :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const updateServicesForAnimalType = async (req, res) => {
  const { id } = req.params;
  const { serviceIds } = req.body;

  if (!Array.isArray(serviceIds)) {
    return res.status(400).json({ error: 'Le champ serviceIds doit être un tableau' });
  }

  try {
    await animalTypeService.updateServices(id, serviceIds);
    res.json({ message: 'Services mis à jour avec succès' });
  } catch (err) {
    console.error('Erreur lors de la mise à jour des services :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  getServicesForAnimalType,
  updateServicesForAnimalType,
  getServicesAndOccurencesForAllAnimalTypes
};