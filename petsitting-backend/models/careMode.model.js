const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CareMode = sequelize.define('CareMode', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  CareMode.associate = models => {
    CareMode.belongsToMany(models.Offer, {
      through: 'OfferCareMode',
      foreignKey: 'careModeId',
      otherKey: 'offerId',
      as: 'offers'
    });
  };

  return CareMode;
};