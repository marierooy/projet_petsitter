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
  const errors = [];
  // 🔎 Récupération de l’offre et de son animalType associé
  const offer = await Offer.findByPk(offerId, {
    include: [{ model: AnimalType, as: 'animalType' }]
  });

  if (!offer) {
    errors.push(`Offer ${offerId} introuvable`);
  }

  const animalType = offer.animalType;
  if (!animalType) {
    errors.push(`Aucun animalType associé à l’offre ${offerId}`);
  }

  // Vérifie qu'il y a au moins un service
  if (!services || services.length === 0) {
    errors.push(`L’offre associée au type d'animal "${animalType.name}" doit avoir au moins un service associé`);
  }

  // Vérifie qu'au moins une occurrence est cochée pour chaque service
  for (const service of services) {
    const occurences = service.occurences || [];
    const hasChecked = occurences.some(occ => occ.checked);
    if (!hasChecked) {
      const serviceOrigin = await Service.findByPk(service.id, { attributes: ["label"] });
      const serviceLabel = serviceOrigin ? serviceOrigin.label : `#${service.id}`;
      errors.push(`Le service "${serviceLabel}" associé au type d'animal "${animalType.name}" doit avoir au moins une occurrence cochée`);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join(" | ")); // ou JSON.stringify(errors) si tu veux un tableau côté front
  }

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
  const errors = [];
  // 🔎 Récupération de l’offre et de son animalType associé
  const offer = await Offer.findByPk(offerId, {
    include: [{ model: AnimalType, as: 'animalType' }]
  });

  if (!offer) {
    errors.push(`Offer ${offerId} introuvable`);
  }

  const animalType = offer.animalType;
  if (!animalType) {
    errors.push(`Aucun animalType associé à l’offre ${offerId}`);
  }

    // Vérifie qu'il y a au moins un service
  if (!offerServiceOccurences || offerServiceOccurences.length === 0) {
    errors.push(`L’offre associée au type d'animal "${animalType.name}" doit avoir au moins un service associé`);
  }

  // Vérifie qu'au moins une occurrence est cochée pour chaque service
  const servicesGrouped = offerServiceOccurences.reduce((acc, occ) => {
    if (!acc[occ.serviceId]) acc[occ.serviceId] = [];
    acc[occ.serviceId].push(occ);
    return acc;
  }, {});

  for (const serviceId of Object.keys(servicesGrouped)) {
    const hasChecked = servicesGrouped[serviceId].some(occ => occ.checked);
    if (!hasChecked) {
      const service = await Service.findByPk(serviceId, { attributes: ["label"] });
      const serviceLabel = service ? service.label : `#${serviceId}`;
      errors.push(`Le service "${serviceLabel}" associé au type d'animal "${animalType.name}" doit avoir au moins une occurrence cochée`);
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join(" | ")); // ou JSON.stringify(errors) si tu veux un tableau côté front
  }

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
  if (offer) {
    // Offres trouvées
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