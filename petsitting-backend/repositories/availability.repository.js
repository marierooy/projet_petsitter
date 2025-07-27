const { Availability, AvailabilityType } = require('../models');
const offerRepository = require('../repositories/offer.repository');
const animalTypeRepository = require('../repositories/animalType.repository');
const offerService = require('../services/offer.service');

async function findAllByPetsitter(petsitterId) {
  return await Availability.findAll({
    where: { petsitterId },
    order: [['start_date', 'ASC']],
    include: [
      {
        model: AvailabilityType,
        as: 'type', 
        attributes: ['id', 'label', 'color'] 
      }
    ]
  });
}

const createAvailability = async (petsitterId, data) => {
  const availability = await Availability.create({...data, petsitterId});
  const animalTypes = await animalTypeRepository.findAll();
  const animalTypeResults = await Promise.all(
    animalTypes.map(async (animalType) => {
      const createdOffer = await offerRepository.findOffersByUserAvailabilityAndAnimalType(
        petsitterId,
        availability.id,
        animalType.id
      );
      if (createdOffer.dataValues) {
        createdOffer.dataValues.availabilityId = availability.id;
      } else {
        createdOffer.availabilityId = availability.id;
      }
      await offerService.updateOffer(animalType.id, petsitterId, createdOffer);
    }))
  return availability;
};

const updateAvailability = async (id, data) => {
  const availability = await Availability.findByPk(id);
  if (!availability) return null;
  return await availability.update(data);
};

const deleteAvailability = async (id) => {
  const availability = await Availability.findByPk(id);
  if (!availability) return null;
  return await availability.destroy();
};

const findAvailabilityById = async (id) => {
  return await Availability.findByPk(id);
};

module.exports = {
  createAvailability,
  updateAvailability,
  deleteAvailability,
  findAvailabilityById,
  findAllByPetsitter
};