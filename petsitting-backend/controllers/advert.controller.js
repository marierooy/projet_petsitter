const advertService = require('../services/advert.service');

const createAdvert = async (req, res) => {
  try {
    const userId = req.user.id;
    const advertData = { ...req.body, userId };

    const createdAdvert = await advertService.createAdvert(advertData);
    res.status(201).json(createdAdvert);
  } catch (err) {
    console.error('Erreur createAdvert :', err);
    res.status(500).json({ error: 'Erreur lors de la création de l’annonce.' });
  }
};

const getRecentAdverts = async (req, res) => {
  try {
    const userId = req.user.id;
    const adverts = await advertService.getRecentAdvertsForUser(userId);
    res.json(adverts);
  } catch (err) {
    console.error('Erreur getRecentAdverts :', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des annonces récentes.' });
  }
};

const getUpcomingAdverts = async (req, res) => {
  try {
    const userId = req.user.id;
    const adverts = await advertService.getUpcomingAdverts(userId);
    res.status(200).json(adverts);
  } catch (error) {
    console.error("Erreur getUpcomingAdverts :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des annonces à venir." });
  }
};

const deleteAdvert = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await advertService.deleteAdvert(id);
    if (!deleted) {
      return res.status(404).json({ message: "Annonce non trouvée." });
    }
    res.status(200).json({ message: "Annonce supprimée avec succès." });
  } catch (err) {
    console.error("Erreur deleteAdvert :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = {
  createAdvert, getRecentAdverts, getUpcomingAdverts, deleteAdvert
};