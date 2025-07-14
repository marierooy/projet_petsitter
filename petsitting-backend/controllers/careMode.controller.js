const careModeService = require('../services/careMode.services');

async function getCareModes(req, res) {
  try {
    const careModes = await careModeService.getAllCareModes();
    res.json(careModes);
  } catch (error) {
    console.error('Erreur lors de la récupération des careModes :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

module.exports = {
  getCareModes,
};