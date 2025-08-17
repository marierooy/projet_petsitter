const offerServiceOccurenceService = require('../services/offerServiceOccurence.service');

const addServiceOccurenceToOffer = async (req, res) => {
  const { offerId } = req.params;
  const { serviceId, occurenceId, price } = req.body;

  try {
    const newEntry = await offerServiceOccurenceService.addServiceOccurenceToOffer(
      offerId,
      serviceId,
      occurenceId,
      price
    );

    res.status(201).json(newEntry);
  } catch (error) {
    console.error('Erreur addServiceOccurenceToOffer:', error);
    res.status(error.status || 500).json({ message: error.message || 'Erreur serveur.' });
  }
};

const removeServiceOccurenceFromOffer = async (req, res) => {
  const { offerId, id } = req.params;

  try {
    await offerServiceOccurenceService.removeServiceOccurenceFromOffer(offerId, id);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Erreur removeServiceOccurenceFromOffer:', error);
    res.status(error.status || 500).json({ message: error.message || 'Erreur serveur.' });
  }
};

const updateOfferServiceOccurence = async (req, res) => {
  const { offerId, osoId } = req.params;
  const { serviceId, occurenceId, price } = req.body;

  try {
    const updated = await offerServiceOccurenceService.modifyServiceOccurenceOnOffer(
      offerId,
      osoId,
      serviceId,
      occurenceId,
      price,
    );

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = { addServiceOccurenceToOffer, removeServiceOccurenceFromOffer, updateOfferServiceOccurence };