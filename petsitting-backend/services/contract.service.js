const { Contract, AdvertOfferContract, OfferServiceOccurence, Advert, Offer, Service, Occurence, User, Sequelize } = require('../models');

const createContract = async ({ petsitter, requestData, ownerId }) => {

  const { syntheticOffers } = petsitter;

  const contract = await Contract.create({
      petsitter_validation: false,
      owner_validation: true,
      total_price: petsitter.total_price,
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

module.exports = {
  createContract,
  getContractsForUser
};