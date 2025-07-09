const availabilityService = require('../services/availability.service');

async function getAllAvailabilitiesByPetsitter(req, res) {
  try {
    const availabilities = await availabilityService.getAllAvailabilitiesByPetsitter(req.user.id);
    res.json(availabilities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des disponibilités' });
  }
}

const createAvailability = async (req, res) => {
  try {
    const availability = await availabilityService.create(req.user.id, req.body);
    res.status(201).json(availability);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création.' });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const updated = await availabilityService.update(req.params.id, req.user.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Disponibilité non trouvée ou accès refusé.' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la modification.' });
  }
};

const deleteAvailability = async (req, res) => {
  try {
    const deleted = await availabilityService.remove(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ message: 'Disponibilité non trouvée ou accès refusé.' });
    res.json({ message: 'Disponibilité supprimée.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
};

module.exports = {
  getAllAvailabilitiesByPetsitter,
  createAvailability,
  updateAvailability,
  deleteAvailability
};