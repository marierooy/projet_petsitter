const careModeRepository = require('../repositories/careMode.repository');

async function getAllCareModes() {
  return await careModeRepository.findAllCareModes();
}

module.exports = {
  getAllCareModes,
};