const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Offer = sequelize.define('Offer', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    number_animals: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    offer_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    travel_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    }
  });

  Offer.associate = models => {
    Offer.belongsTo(models.AnimalType, {
      foreignKey: {
        name: 'animalTypeId',
        allowNull: false
      },
      as: 'animalType'
    });

    Offer.belongsTo(models.User, {
      foreignKey: {
        name: 'petsitterId',
        allowNull: false
      },
      as: 'petsitter'
    });

    Offer.hasMany(models.OfferServiceOccurence, {
      foreignKey: 'offerId',
      as: 'offerServiceOccurences'
    });

    Offer.belongsToMany(models.CareMode, {
      through: 'OfferCareMode',
      foreignKey: 'offerId',
      otherKey: 'careModeId',
      as: 'careModes'
    });

    // ✅ Remplacement Many-to-Many par une relation BelongsTo
    Offer.belongsTo(models.Availability, {
      foreignKey: {
        name: 'availabilityId',
        allowNull: false
      },
      as: 'availability'
    });
  };

  return Offer;
};