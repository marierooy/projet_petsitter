const evaluateRepository = require('../repositories/evaluate.repository');
const { Contract, AdvertOfferContract } = require('../models');

const createEvaluate = async (ownerId, contractId, comment, rate) => {
  // Récupération du contrat
  const contract = await Contract.findByPk(contractId, {
    include: [
        {
            model: AdvertOfferContract,
        },
    ]
  });

  if (!contract) {
    throw new Error('CONTRACT_NOT_FOUND');
  }

  if (!contract.owner_validation || !contract.petsitter_validation) {
    throw new Error('CONTRACT_NOT_CO_VALIDATED');
  }

  if (contract.AdvertOfferContracts[0].owner_id !== ownerId) {
    throw new Error('NOT_CONTRACT_OWNER');
  }

  const already = await evaluateRepository.findByContractAndUser(contractId, ownerId);
  if (already) {
    throw new Error('ALREADY_EVALUATED');
  }

  console.log(ownerId);
  console.log(contract.AdvertOfferContracts[0].petsitter_id)

  return evaluateRepository.create({
    comment,
    rate,
    contract_id: contractId,
    user_id: ownerId,
    target_user_id: contract.AdvertOfferContracts[0].petsitter_id
  });
};


const getEvaluationsByPetsitterId = async (petsitterId) => {
  const evaluations = await evaluateRepository.findByPetsitterId(petsitterId);

  const averageRate =
    evaluations.length > 0
      ? evaluations.reduce((sum, ev) => sum + ev.rate, 0) / evaluations.length
      : 0;

  return {
    evaluations,
    averageRate,
  };
};

async function deleteEvaluation(id) {
  return evaluateRepository.deleteEvaluation(id);
}

module.exports = {
  createEvaluate,
  getEvaluationsByPetsitterId,
  deleteEvaluation,
};