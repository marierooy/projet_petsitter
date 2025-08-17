const evaluateService = require('../services/evaluate.service');

const createEvaluate = async (req, res) => {
  try {
    const { contractId, comment, rate } = req.body;
    const ownerId = req.user.id;

    const evaluation = await evaluateService.createEvaluate(ownerId, contractId, comment, rate);

    res.status(201).json(evaluation);
  } catch (err) {
    console.error(err);

    const errors = {
      CONTRACT_NOT_FOUND: { status: 404, message: 'Contrat introuvable' },
      CONTRACT_NOT_CO_VALIDATED: { status: 400, message: 'Le contrat n’est pas co-validé' },
      NOT_CONTRACT_OWNER: { status: 403, message: 'Vous n’êtes pas le propriétaire du contrat' },
      ALREADY_EVALUATED: { status: 400, message: 'Vous avez déjà évalué ce contrat' }
    };

    if (errors[err.message]) {
      return res.status(errors[err.message].status).json({ message: errors[err.message].message });
    }

    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getEvaluationsByPetsitter = async (req, res) => {
  try {
    const { petsitterId } = req.params;
    const result = await evaluateService.getEvaluationsByPetsitterId(petsitterId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de récupérer les évaluations.' });
  }
};

async function deleteEvaluation(req, res) {
  try {
    await evaluateService.deleteEvaluation(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(403).json({ error: err.message });
  }
}

module.exports = { 
    createEvaluate,
    getEvaluationsByPetsitter,
    deleteEvaluation,
 };