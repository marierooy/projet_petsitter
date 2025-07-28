const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Contract = sequelize.define('Contract', {
    petsitter_validation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    owner_validation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    estimate: {
      type: DataTypes.TEXT, // ou TEXT si tu préfères une chaîne
      allowNull: true,
    },
  }, {
    tableName: 'Contracts',
    timestamps: true, // createdAt / updatedAt
  });

  Contract.associate = (models) => {
    Contract.hasOne(models.AdvertOfferContract, { foreignKey: 'contract_id' });
  };

  return Contract;
};