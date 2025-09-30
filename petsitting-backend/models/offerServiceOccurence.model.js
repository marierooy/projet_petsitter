const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OfferServiceOccurence = sequelize.define('OfferServiceOccurence', {
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Le prix de service doit être supérieur ou égal à 0',
        },
      },
    },
    checked: {
      type: DataTypes.BOOLEAN,
    },
    offerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    occurenceId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  OfferServiceOccurence.associate = models => {
    OfferServiceOccurence.belongsTo(models.Offer, {
      foreignKey: 'offerId',
      as: 'offer'
    });

    OfferServiceOccurence.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service'
    });

    OfferServiceOccurence.belongsTo(models.Occurence, {
      foreignKey: 'occurenceId',
      as: 'occurence'
    });
  };

  return OfferServiceOccurence;
};