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

const getUserContracts = async (req, res) => {
  try {
    const userId = req.user.id;
    const contracts = await contractService.getContractsForUser(userId);
    res.status(200).json(contracts);
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  getUserContracts,
  createContract,
};