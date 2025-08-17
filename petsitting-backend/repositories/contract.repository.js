const { Contract, AdvertOfferContract, Evaluate } = require('../models');

const findByPetsitterIdOwnerId = async(petsitterId, ownerId) => {
  const contracts = await Contract.findAll({        
    include: [
        {
            model: AdvertOfferContract,
            where: { petsitter_id: petsitterId, owner_id: ownerId }
        },
        {
            model: Evaluate,
            as: 'evaluations',
            required: false // important pour ne pas exclure les contrats non évalués
        }
    ],
    });
    
    if (!contracts) return [];

    return contracts.map(c => {
        const data = c.toJSON();
        data.evaluated = data.evaluations && data.evaluations.length > 0;
        return data;
    });
};

module.exports = {
  findByPetsitterIdOwnerId,
};