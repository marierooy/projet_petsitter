const { CareMode } = require('../models');

async function findAllCareModes() {
  return await CareMode.findAll();
}

module.exports = {
  findAllCareModes,
};