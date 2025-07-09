const { Occurence, Service } = require('../models');

const findAllWithServices = () => {
  return Occurence.findAll({
    include: [
      {
        model: Service,
        as: 'services', // Assure-toi que l'alias correspond à celui défini dans le modèle
        through: { attributes: [] } // Ne pas inclure les colonnes de la table de jointure
      }
    ]
  });
};

module.exports = { findAllWithServices };