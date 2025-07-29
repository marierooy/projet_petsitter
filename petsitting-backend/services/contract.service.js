const { Contract, AdvertOfferContract } = require('../models');

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
    console.log(syntheticOffer);

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

module.exports = {
  createContract,
};