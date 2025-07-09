const occurenceService = require('../services/occurence.service');

const getAllOccurences = async (req, res) => {
  try {
    const occurences = await occurenceService.findAll();
    res.json(occurences);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des occurrences' });
  }
};

module.exports = { getAllOccurences };