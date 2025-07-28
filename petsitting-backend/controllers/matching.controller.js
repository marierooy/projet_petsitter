const matchingService = require('../services/matching.service');

const findMatchingPetsitters = async (req, res) => {
  try {
    const result = await matchingService.findMatchingPetsitters(req.body);
    console.log('resultController',result);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { findMatchingPetsitters };