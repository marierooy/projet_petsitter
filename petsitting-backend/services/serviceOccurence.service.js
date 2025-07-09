const repository = require('../repositories/serviceOccurence.repository');

const getOccurencesByServiceId = async (serviceId) => {
  return repository.findOccurencesByServiceId(serviceId);
};

const updateOccurencesForService = async (serviceId, occurenceIds) => {
  return repository.setOccurencesForService(serviceId, occurenceIds);
};

module.exports = {
  getOccurencesByServiceId,
  updateOccurencesForService,
};
