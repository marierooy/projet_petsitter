const { AnimalType, Service, Occurence, Availability, Offer, OfferServiceOccurence, CareMode } = require('../models');
const { getServicesAndOccurencesByAnimalType } = require('../repositories/animalTypeService.repository');
const { Op } = require('sequelize');

const findByAnimalPetsitterAndAvailability = async (animalTypeId, petsitterId, availabilityId) => {
  return await Offer.findOne({
    where: { animalTypeId, petsitterId, availabilityId }
  });
};

const create = async (data) => {
  return await Offer.create(data);
};

const updateOfferServicesAndOccurrences = async (offerId, services) => {
  await OfferServiceOccurence.destroy({ where: { offerId } });

  for (const service of services) {
    for (const occ of service.occurences || []) {
      await OfferServiceOccurence.create({
        offerId,
        serviceId: service.id,
        occurenceId: occ.id,
        price: occ.price || 0,
        checked: occ.checked,
      });
    }
  }
};

const updateRawOfferServicesAndOccurrences = async (offerId, offerServiceOccurences) => {
  await OfferServiceOccurence.destroy({ where: { offerId } });

  for (const offerServiceOccurence of offerServiceOccurences) {
    await OfferServiceOccurence.create({
      offerId,
      serviceId: offerServiceOccurence.serviceId,
      occurenceId: offerServiceOccurence.occurenceId,
      price: offerServiceOccurence.price || 0,
      checked: offerServiceOccurence.checked,
    });
  }
};

async function findOffersByUserAvailabilityAndAnimalType(petsitterId, availabilityId, animalTypeId) {
  // On récupère les offres pour l'user et availability donnée (avec leurs services, etc. si besoin)
  const offer = await Offer.findOne({
    where: { petsitterId, availabilityId, animalTypeId },
    include: [
      { model: AnimalType, as: 'animalType' },
      {
        model: OfferServiceOccurence,
        as: 'offerServiceOccurences',
        include: [
          { model: Service, as: 'service' },
          {
            model: Occurence,
            as: 'occurence',   // Attention à l'alias défini dans ton association Sequelize
          }
        ],
      },
      { model: Availability, as: 'availability' },
      {
        model: CareMode,
        as: 'careModes',
        through: { attributes: [] }, // Ne pas inclure les colonnes de la table pivot
      },
    ],
  });
  if (offer) {
    // 💡 Offres trouvées : tu peux faire une action ici
    return offer;
  }

  const currentAvailability = await Availability.findOne({
    where: {
      id: availabilityId
    }
  });

  // On cherche la dernière disponibilité
  const lastAvailability = await Availability.findOne({
    where: {
      petsitterId,
      availabilityTypeId: currentAvailability.availabilityTypeId,
      id: {
        [Op.ne]: availabilityId // exclut la disponibilité avec cet id
      }
    },
    order: [['start_date', 'DESC']],
  });

  if (!lastAvailability || (Array.isArray(lastAvailability) && lastAvailability.length == 0)) {
    // Pas de disponibilité trouvée => retourne toutes les données de tous les types d'animaux avec services & occurences
    return getServicesAndOccurencesByAnimalType(animalTypeId);
  }

  // Sinon, retourne les offres sur la dernière disponibilité
  return Offer.findOne({
    where: { petsitterId, 
      availabilityId: lastAvailability.id,
      animalTypeId },
    include: [
      { model: AnimalType, as: 'animalType' },
      {
        model: OfferServiceOccurence,
        as: 'offerServiceOccurences',
        include: [
          { model: Service, as: 'service' },
          {
            model: Occurence,
            as: 'occurence',  
          }
        ],
      },
      { model: Availability, as: 'availability' },
      {
        model: CareMode,
        as: 'careModes',
        through: { attributes: [] }, // Ne pas inclure les colonnes de la table pivot
      },
    ],
  });
}

const deleteOfferByAnimalPetsitterAndAvailability = async (animalTypeId, petsitterId, availabilityId) => {
  return await Offer.destroy({
    where: {
      animalTypeId,
      petsitterId,
      availabilityId
    }
  });
};

module.exports = { 
  findByAnimalPetsitterAndAvailability, 
  create, 
  updateOfferServicesAndOccurrences, 
  updateRawOfferServicesAndOccurrences,
  findOffersByUserAvailabilityAndAnimalType,
  deleteOfferByAnimalPetsitterAndAvailability,
 };