const { CareMode, OfferServiceOccurence } = require('../models');
const offerRepository = require('../repositories/offer.repository');
const animalTypeRepository = require('../repositories/animalType.repository');
const animalTypeServiceRepository = require('../repositories/animalTypeService.repository');

const updateOffer = async (animalId, petsitterId, data) => {
  const {
    number_animals,
    offer_price,
    travel_price,
    availabilityId,
    careModes = {},
    services = []
  } = data;

  // 1. Trouver ou créer l'offre
  let offer = await offerRepository.findByAnimalPetsitterAndAvailability(animalId, petsitterId, availabilityId);

  if (!offer) {
    offer = await offerRepository.create({
      animalTypeId: animalId,
      petsitterId,
      number_animals,
      offer_price,
      travel_price,
      availabilityId
    });
  } else {
    await offer.update({ number_animals, offer_price, travel_price });
  }

  // 2. Mettre à jour les modes de garde
  const modeLabels = Object.entries(careModes)
    .filter(([, enabled]) => enabled)
    .map(([label]) => label);

  const modes = await CareMode.findAll({
    where: {
      label: modeLabels
    }
  });

  await offer.setCareModes(modes); // Remplace les anciens

  // 3. Mettre à jour les services et occurrences
  await offerRepository.updateOfferServicesAndOccurrences(offer.id, services);
};

async function getOffersByUserAndAvailability(petsitterId, availabilityId) {
  if (!petsitterId) {
    throw new Error('petsitterId est obligatoire');
  }

  let animalTypes = await animalTypeRepository.findAnimalTypesWithOffers(availabilityId, petsitterId);

  if (!animalTypes || (Array.isArray(animalTypes) && animalTypes.length == 0)) {
    animalTypes = await animalTypeRepository.findAll();
  }
  const animalTypeResults = await Promise.all(
    animalTypes.map(async (animalType) => {
      const offer = await offerRepository.findOffersByUserAvailabilityAndAnimalType(
        petsitterId,
        availabilityId,
        animalType.id
      );

      const animalTypeServices = await animalTypeServiceRepository.getServicesAndOccurencesByAnimalType(animalType.id)

      const allServices = animalTypeServices.map(service => ({
        id: service.id,
        label: service.label,
        basic_service: service.basic_service,
        occurences: service.occurences.map(occ => ({
          id: occ.id,
          label: occ.label, 
          checked: occ.checked,
        }))
      }));

      const groupedServices = [];

      const rawOffer = offer && !Array.isArray(offer) ? offer.get({ plain: true }): null;

      let careModes = [];

      if (rawOffer) {
        careModes = rawOffer?.careModes?.reduce((acc, item, index) => {
          acc[index] = item;         // Ajout en tant qu'élément indexé
          acc[item.label] = true;    // Ajout en tant que propriété dynamique
          return acc;
        }, {});
        for (const occ of rawOffer.offerServiceOccurences) {
          const service = occ.service;
          const occurence = occ.occurence;

          // On cherche si le service est déjà dans le tableau
          let existing = groupedServices.find(s => s.id === service.id);

          if (!existing) {
            // S'il n'existe pas, on le crée avec sa première occurence
            groupedServices.push({
              id: service.id,
              label: service.label,
              basic_service: service.basic_service,
              occurences: occurence ? [{
                id: occurence.id,
                label: occurence.label,
                checked: occ.checked,
                price: occ.price,
              }] : []
            });
          } else {
            // S'il existe déjà, on ajoute l'occurence s'il n'y est pas déjà
            if (occurence && !existing.occurences.some(o => o.id === occurence.id)) {
              existing.occurences.push({
                id: occurence.id,
                label: occurence.label,
                checked: occ.checked,
                price: occ.price,
              });
            }
          }
        }
      }

      return {
        id: animalType.id,
        name: animalType.name,
        number_animals: offer.number_animals,
        offer_price: offer.offer_price,
        travel_price: offer.travel_price,
        careModes: careModes,
        services: groupedServices && Array.isArray(groupedServices) && groupedServices.length > 0 ? groupedServices: allServices.filter(service => service.basic_service === true),
        allServices: allServices
      };
    })
  );

  return animalTypeResults;
}


const deleteOffer = async (animalTypeId, petsitterId, availabilityId) => {
  const deletedCount = await offerRepository.deleteOfferByAnimalPetsitterAndAvailability(
    animalTypeId,
    petsitterId,
    availabilityId
  );

  if (deletedCount === 0) {
    throw new Error('Aucune offre trouvée à supprimer.');
  }

  return { message: 'Offre supprimée avec succès.' };
};

module.exports = {
  updateOffer, 
  getOffersByUserAndAvailability,
  deleteOffer
};