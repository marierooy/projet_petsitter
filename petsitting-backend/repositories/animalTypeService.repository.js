const { AnimalType, Service, Occurence } = require('../models');

const getServicesAndOccurencesForAllAnimalTypes = async () => {
  const animalTypes = await AnimalType.findAll({
    include: {
      model: Service,
      through: { attributes: [] },
      include: {
        model: Occurence,
        as: 'occurences',
        through: { attributes: [] }
      }
    }
  });

  return animalTypes.map(animalType => {
    const allServices = animalType.Services.map(service => ({
      id: service.id,
      label: service.label,
      basic_service: service.basic_service,
      occurences: service.occurences.map(occ => ({
        id: occ.id,
        label: occ.label,
        checked: occ.checked,
      }))
    }));

    return {
      id: animalType.id,
      name: animalType.name,
      services: allServices.filter(service => service.basic_service === true),
      allServices: allServices
    };
  });
};

const getServicesAndOccurencesByAnimalType = async (animalTypeId) => {
  const animalType = await AnimalType.findByPk(animalTypeId, {
    include: {
      model: Service,
      through: { attributes: [] },
      include: {
        model: Occurence,
        as: 'occurences',
        through: { attributes: [] }
      }
    }
  });
  return animalType?.Services || [];
};

const getServicesByAnimalType = async (animalTypeId) => {
  const animalType = await AnimalType.findByPk(animalTypeId, {
    include: {
      model: Service,
      through: { attributes: [] } // Ne renvoie pas la table pivot
    }
  });
  return animalType?.Services || [];
};

const setServicesForAnimalType = async (animalTypeId, serviceIds) => {
  const animalType = await AnimalType.findByPk(animalTypeId);
  if (!animalType) throw new Error('AnimalType non trouvé');

  // Associe uniquement les IDs fournis (remplace les anciens liens)
  await animalType.setServices(serviceIds);
};

module.exports = {
  getServicesByAnimalType,
  setServicesForAnimalType,
  getServicesAndOccurencesForAllAnimalTypes,
  getServicesAndOccurencesByAnimalType,
};