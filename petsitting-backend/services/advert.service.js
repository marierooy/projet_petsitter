const advertRepo = require('../repositories/advert.repository');

const createAdvert = async ({ startDate, endDate, userId, animalId, careModeId, services }) => {
  // Crée l'annonce
  const advert = await advertRepo.createAdvert({
    startDate,
    endDate,
    userId,
    animalId,
    careModeId
  });

  // Associe chaque couple service/occurence
  for (const { serviceId, occurrenceId } of services) {
    await advertRepo.addServiceOccurence(advert.id, serviceId, occurrenceId);
  }

  return advert;
};

const getRecentAdvertsForUser = async (userId) => {
  return await advertRepo.getMostRecentAdvertsByUser(userId);
};

const getUpcomingAdverts = async (userId) => {
  return await advertRepo.findUpcomingAdverts(userId);
};

const deleteAdvert = async (id) => {
  return await advertRepo.deleteAdvert(id);
};

module.exports = {
  createAdvert, getRecentAdvertsForUser, getUpcomingAdverts, deleteAdvert
};