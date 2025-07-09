const serviceService = require('../services/service.service');

const getAll = async (req, res) => {
  try {
    const services = await serviceService.getAllServices();
    res.json(services);
  } catch (error) {
    console.error('Erreur lors de la récupération des services :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { getAll };