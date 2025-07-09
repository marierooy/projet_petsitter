const { Service, Occurence } = require('../models');

const findOccurencesByServiceId = async (serviceId) => {
  const service = await Service.findByPk(serviceId, {
    include: {
      model: Occurence,
      as: 'occurences',
      through: { attributes: [] }, // ignore la table de jonction dans le résultat
    },
  });
  return service ? service.occurences : [];
};

const setOccurencesForService = async (serviceId, occurenceIds) => {
  const service = await Service.findByPk(serviceId);
  if (!service) throw new Error('Service non trouvé');
  await service.setOccurences(occurenceIds); // Sequelize gère la table de jonction
};

module.exports = {
  findOccurencesByServiceId,
  setOccurencesForService,
};