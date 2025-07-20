const matchingRepository = require('../repositories/matching.repository');

const findMatchingPetsitters = async (criteria) => {
  return matchingRepository.findMatchingPetsitters(criteria);
};

module.exports = {
  findMatchingPetsitters,
};