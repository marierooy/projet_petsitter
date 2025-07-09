const { AnimalType, Offer } = require('../models');

const findAll = async () => {
  return await AnimalType.findAll();
};

const findAnimalTypesWithOffers = async (availabilityId, petsitterId) => {
  return await AnimalType.findAll({
    include: [{
      model: Offer,
      as: 'offers',
      where: {
        availabilityId,
        petsitterId,
      },
      attributes: [], // on ne récupère que les AnimalTypes
    }]
  });
};

module.exports = { findAll, findAnimalTypesWithOffers };
