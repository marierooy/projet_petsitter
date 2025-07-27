const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdvertOfferContract = sequelize.define('AdvertOfferContract', {
    advert_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Adverts',
        key: 'id'
      }
    },
    offer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Offers',
        key: 'id'
      }
    },
    contract_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Contracts',
        key: 'id'
      }
    },
    petsitter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
  }, {
    tableName: 'advert_offer_contracts',
    timestamps: true,
  });

  AdvertOfferContract.associate = models => {
    AdvertOfferContract.belongsTo(models.Advert, { foreignKey: 'advert_id' });
    AdvertOfferContract.belongsTo(models.Offer, { foreignKey: 'offer_id' });
    AdvertOfferContract.belongsTo(models.Contract, { foreignKey: 'contract_id' });
    AdvertOfferContract.belongsTo(models.User, { as: 'Petsitter', foreignKey: 'petsitter_id' });
    AdvertOfferContract.belongsTo(models.User, { as: 'Owner', foreignKey: 'owner_id' });
  };

  return AdvertOfferContract;
};