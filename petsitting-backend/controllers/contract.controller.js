const contractService = require('../services/contract.service');
const nodemailer = require('nodemailer');

const createContract = async (req, res) => {
  try {
    const { petsitter, requestData } = req.body;
    const ownerId = req.user.id;

    const contract = await contractService.createContract({ petsitter, requestData, ownerId });

    // await sendEmailDemandeDeGarde(contract);

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

    if (updatedContract.owner_validation && updatedContract.petsitter_validation) {
      // envoyer email aux deux
      // await sendEmailsCoValidation(updatedContract);
    }

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

async function sendEmailsCoValidation(contract) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'rooy.marie@gmail.com',
      pass: 'vxtp dqco byfv cwdt',
    },
  });

  const ownerEmail = contract.AdvertOfferContracts[0].Owner.email;
  const petsitterEmail = contract.AdvertOfferContracts[0].Petsitter.email;

  const mailOptions = {
    from: '"Petsitting App" <no-reply@petsitting.com>',
    to: [ownerEmail, petsitterEmail].join(','),
    subject: 'Contrat validé ✔️',
    text: `Bonjour,\n\nLe contrat #${contract.id} a été validé par les deux parties.\nVous pouvez désormais commencer la prestation.\n\nMerci.`,
  };

  await transporter.sendMail(mailOptions);
}

async function sendEmailDemandeDeGarde(contract) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'rooy.marie@gmail.com',
      pass: 'vxtp dqco byfv cwdt',
    },
  });

  const petsitterEmail = contract.AdvertOfferContracts[0].Petsitter.email;

  const mailOptions = {
    from: '"Petsitting App" <no-reply@petsitting.com>',
    to: petsitterEmail,
    subject: 'Demande de garde',
    text: `Bonjour,\n\n${contract.AdvertOfferContracts[0].Owner.first_name} ${contract.AdvertOfferContracts[0].Owner.last_name} vous demande pour une garde du ${new Date(contract.AdvertOfferContracts[0].Advert.startDate).toLocaleDateString("fr-FR", { 
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} au ${new Date(contract.AdvertOfferContracts[0].Advert.endDate).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })}.\n\nPour plus d'informations, rendez-vous sur le site.\n\nMerci.`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  getUserContracts,
  createContract,
  deleteContract,
  validateContract,
  getContractsByPetsitterIdOwnerId
};