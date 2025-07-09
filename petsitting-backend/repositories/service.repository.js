const { Service } = require('../models');

const findAll = async () => {
  return await Service.findAll();
};

module.exports = { findAll };