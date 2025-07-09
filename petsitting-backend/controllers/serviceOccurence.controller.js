const service = require('../services/serviceOccurence.service');

// GET /api/service/:id/occurences
const getOccurencesByService = async (req, res) => {
  try {
    const occurences = await service.getOccurencesByServiceId(req.params.id);
    res.json(occurences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des occurrences' });
  }
};

// PUT /api/service/:id/occurences
const updateOccurencesForService = async (req, res) => {
  try {
    const { occurenceIds } = req.body;
    await service.updateOccurencesForService(req.params.id, occurenceIds);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des occurrences' });
  }
};

module.exports = { getOccurencesByService, updateOccurencesForService };
