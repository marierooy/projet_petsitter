const { Contract, AdvertOfferContract, OfferServiceOccurence, Advert, Offer, Service, Occurence, User, Sequelize } = require('../models');
const contractRepository = require('../repositories/contract.repository');
const { Op } = require('sequelize');

const createContract = async ({ petsitter, requestData, ownerId }) => {

  const { syntheticOffers } = petsitter;

  const contract = await Contract.create({
      petsitter_validation: false,
      owner_validation: true,
      total_price: petsitter.total_allAnimals_price,
      estimate: null
  });

  for (const syntheticOfferAnimal of syntheticOffers) {
    const { syntheticOffer, animalId } = syntheticOfferAnimal;

    // Retrouver l'advertId correspondant dans requestData
    const matchingRequest = requestData.find(
    (r) => parseInt(r.animalId) === parseInt(animalId)
    );

    if (!matchingRequest || !matchingRequest.advertId) {
    throw new Error(`Impossible de trouver advertId pour l'animal ${animalId}`);
    }

    await AdvertOfferContract.create({
        advert_id: matchingRequest.advertId,
        offer_id: syntheticOffer.offerId,
        contract_id: contract.id,
        petsitter_id: petsitter.id,
        owner_id: ownerId,
    });
  }

  return contract;
};

const getContractsForUser = async (userId) => {
    const contracts = await Contract.findAll({
        // where: { [Op.or]: [{ petsitterId: userId }, { ownerId: userId }] },
        include: [{
            model: AdvertOfferContract,
            include: [
            {
                model: Offer,
                include: [
                {
                    model: OfferServiceOccurence,
                    as: 'offerServiceOccurences',
                    include: ['service', 'occurence'],
                },
                ],
            },
            {
                model: Advert,
                include: ['animal', 'careMode']
            }
            ],
        }],
    });

    return contracts
};

const deleteContract = async (id) => {
    const offerLinks = await AdvertOfferContract.findAll({
        where: { contract_id: id },
        attributes: ['offer_id']
    });
    const offerIds = offerLinks.map(a => a.advert_id);

    await Offer.destroy({ where: { id: offerIds } });
    await AdvertOfferContract.destroy({ where: { contract_id: id } });
    await Contract.destroy({ where: { id } });
};

const validateContract = async (contractId, userId) => {
  const contract = await Contract.findByPk(contractId, {
    include: {
      model: AdvertOfferContract,
      required: true,
    },
  });

  if (!contract) throw new Error("Contrat introuvable");

  const aoc = contract.AdvertOfferContracts?.[0]; // si 1 seul lien par contrat

  if (!aoc) throw new Error("Lien annonce/offre non trouvé pour ce contrat");

  let updatedFields = {};

  if (aoc.owner_id === userId) {
    if (contract.owner_validation) throw new Error("Déjà validé par le propriétaire");
    updatedFields.owner_validation = true;
  } else if (aoc.petsitter_id === userId) {
    if (contract.petsitter_validation) throw new Error("Déjà validé par le petsitter");
    updatedFields.petsitter_validation = true;
  } else {
    throw new Error("Vous n'êtes pas impliqué dans ce contrat");
  }

  await contract.update(updatedFields);
  return contract;
};

const getContractsByPetsitterIdOwnerId = async (petsitterId, ownerId) => {
  const contracts = await contractRepository.findByPetsitterIdOwnerId(petsitterId, ownerId);
  return contracts;
};

module.exports = {
  createContract,
  getContractsForUser,
  deleteContract,
  validateContract,
  getContractsByPetsitterIdOwnerId
};