const serviceRepository = require('../repositories/service.repository');

const getAllServices = async () => {
  return await serviceRepository.findAll();
};

module.exports = {
  getAllServices
};