const contractService = require('../services/contract.service');

const createContract = async (req, res) => {
  try {
    const { petsitter, requestData } = req.body;
    const ownerId = req.user.id;

    const contract = await contractService.createContract({ petsitter, requestData, ownerId });
    res.status(201).json(contract);
  } catch (error) {
    console.error('Error in createContracts controller:', error);
    res.status(500).json({ error: 'Erreur lors de la création des contrats' });
  }
};

module.exports = {
  createContract,
};