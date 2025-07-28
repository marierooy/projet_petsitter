const matchingRepository = require('../repositories/matching.repository');

const findMatchingPetsitters = async (criteria) => {
  console.log('serviceMatching', await matchingRepository.findMatchingPetsitters(criteria))
  return matchingRepository.findMatchingPetsitters(criteria);
};

module.exports = {
  findMatchingPetsitters,
};