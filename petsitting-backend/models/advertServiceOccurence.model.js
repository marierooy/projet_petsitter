const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdvertServiceOccurence = sequelize.define('AdvertServiceOccurence', {
    advertId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    serviceId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    occurenceId: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  });
  
  AdvertServiceOccurence.associate = (models) => {
    AdvertServiceOccurence.belongsTo(models.Advert, {
      foreignKey: 'advertId'
    });

    AdvertServiceOccurence.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service'
    });

    AdvertServiceOccurence.belongsTo(models.Occurence, {
      foreignKey: 'occurenceId',
      as: 'occurence'
    });
  }

  return AdvertServiceOccurence;
};