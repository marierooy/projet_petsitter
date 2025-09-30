const offerService = require('../services/offer.service');

const updateOfferByAnimalId = async (req, res) => {
  const { animalTypeId } = req.params;
  const petsitterId = req.user.id; // suppose un middleware d'auth
  const data = req.body;

  try {
    await offerService.updateOffer(animalTypeId, petsitterId, data);
    return res.status(200).json({ message: 'Offre mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur updateOfferByAnimalId:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

const updateMultipleOffers = async (req, res) => {
  const petsitterId = req.user.id; // dépend de authMiddleware
  const offers = req.body;

  const errors = []; // tableau global pour accumuler les erreurs

  for (const offerData of offers) {
    const { animalTypeId, ...data } = offerData;

    try {
      await offerService.updateOffer(animalTypeId, petsitterId, data);
    } catch (err) {
      console.error(`Erreur pour animalTypeId=${animalTypeId}:`, err);

      // Si updateOffer a lancé un tableau d’erreurs (err.details)
      if (err.details && Array.isArray(err.details)) {
        errors.push(
          err.details
        );
      } else {
        errors.push(err.message || "Erreur inconnue"
        );
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: errors,
      errors
    });
  }

  res.status(200).json({ message: 'Toutes les offres ont été enregistrées.' });
};

async function getOffers(req, res) {
  try {
    const userId = req.user.id;
    const availabilityId = req.query.availabilityId || null;

    if (!userId) {
      return res.status(400).json({ error: 'Le paramètre userId est obligatoire' });
    }

    const offers = await offerService.getOffersByUserAndAvailability(userId, availabilityId);

    res.json(offers);
  } catch (err) {
    console.error('Erreur dans getOffers:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

const deleteOffer = async (req, res) => {
  const { animalTypeId, availabilityId } = req.params;
  const petsitterId = req.user.id;

  try {
    const result = await offerService.deleteOffer(
      parseInt(animalTypeId),
      parseInt(petsitterId),
      parseInt(availabilityId)
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const saveSyntheticOffers = async (req, res) => {
  const petsitterId = req.params.petsitterId;
  const syntheticOffers = req.body;

  try {
    if (!Array.isArray(syntheticOffers)) {
      return res.status(400).json({ error: 'syntheticOffers (array) requis.' });
    }

    const result = await offerService.saveSyntheticOffers(syntheticOffers, petsitterId);

    res.status(201).json(result);
  } catch (err) {
    console.error('Erreur lors de la sauvegarde des syntheticOffers :', err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = { 
  updateOfferByAnimalId, 
  updateMultipleOffers,
  getOffers,
  deleteOffer,
  saveSyntheticOffers
}