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

const deleteContract = async (req, res) => {
  try {
    const contractId = req.params.id;
    await contractService.deleteContract(contractId);
    res.status(200).json({ message: 'Contrat supprimé' });
  } catch (error) {
    console.error('Erreur suppression contrat:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du contrat' });
  }
};

const validateContract = async (req, res) => {
  try {
    const contractId = req.params.id;
    const userId = req.user.id;

    const updatedContract = await contractService.validateContract(contractId, userId);

    res.status(200).json(updatedContract);
  } catch (error) {
    console.error('Erreur lors de la validation du contrat :', error);
    res.status(400).json({ error: error.message });
  }
};

const getContractsByPetsitterIdOwnerId = async (req, res) => {
  try {
    const { petsitterId } = req.params;
    const ownerId = req.user.id;
    const contracts = await contractService.getContractsByPetsitterIdOwnerId(petsitterId, ownerId);

    if (!contracts || contracts.length === 0) {
      return res.status(404).json({ message: 'Aucun contrat trouvé pour ce petsitter' });
    }

    res.json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getUserContracts,
  createContract,
  deleteContract,
  validateContract,
  getContractsByPetsitterIdOwnerId
};