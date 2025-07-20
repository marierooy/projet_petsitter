const { Advert, Animal, CareMode, Service, Occurence, AdvertServiceOccurence, Sequelize } = require('../models');
const { Op } = require('sequelize');

const createAdvert = async ({ startDate, endDate, userId, animalId, careModeId }) => {
  return await Advert.create({
    startDate,
    endDate,
    userId,
    animalId,
    careModeId
  });
};

const addServiceOccurence = async (advertId, serviceId, occurenceId) => {
  return await AdvertServiceOccurence.create({
    advertId,
    serviceId,
    occurenceId
  });
};

const getMostRecentAdvertsByUser = async (userId) => {
  // récupérer tous les animaux du user
  const animals = await Animal.findAll({
    where: { userId },
    attributes: ['id']
  });

  const recentAdverts = [];

  for (const animal of animals) {
    const advert = await Advert.findOne({
    where: { animalId: animal.id, userId },
    include: [
        { model: Animal, as: 'animal' },
        { model: CareMode, as: 'careMode' },
        {
        model: AdvertServiceOccurence,
        as: 'advertServiceOccurences',
        include: [
            { model: Service, as: 'service' },
            { model: Occurence, as: 'occurence' }
        ]
        }
    ],
    order: [['createdAt', 'DESC']]
    });

    if (advert) {
      const serviceOccurrences = advert.advertServiceOccurences.map(assoc => ({
        serviceId: assoc.service.id,
        occurrenceId: assoc.occurence.id
      }));

      recentAdverts.push({
        animalId: advert.animalId,
        careMode: advert.careMode,
        startDate: advert.startDate,
        endDate: advert.endDate,
        serviceOccurrences
      });
    }
  }

  return recentAdverts;
};

const findUpcomingAdverts = async (userId) => {
  const now = new Date();

  return await Advert.findAll({
    where: {
      startDate: {
        [Op.gt]: now
      },
      userId
    },
    include: [
      { model: Animal, as: 'animal' },
      { model: CareMode, as: 'careMode' },
      {
        model: AdvertServiceOccurence,
        as: 'advertServiceOccurences',
        include: [
          { model: Service, as: 'service' },
          { model: Occurence, as: 'occurence' }
        ]
      }
    ],
    order: [['startDate', 'ASC']]
  });
};

const deleteAdvert = async (id) => {
  const advert = await Advert.findByPk(id);
  if (!advert) return null;
  await advert.destroy();
  return true;
};

module.exports = {
  createAdvert,
  addServiceOccurence,
  getMostRecentAdvertsByUser,
  findUpcomingAdverts,
  deleteAdvert,
};