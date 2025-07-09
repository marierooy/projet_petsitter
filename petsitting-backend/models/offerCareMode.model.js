const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OfferCareMode = sequelize.define('OfferCareMode', {
    offerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Offers',
        key: 'id'
      }
    },
    careModeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CareModes',
        key: 'id'
      }
    }
  }, {
    timestamps: false,
    tableName: 'OfferCareMode'
  });

  return OfferCareMode;
};
