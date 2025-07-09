const occurenceRepository = require('../repositories/occurence.repository');

const findAll = () => {
  return occurenceRepository.findAllWithServices();
};

module.exports = {
  findAll
};