const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Service = sequelize.define('Service', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    basic_service: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },   
  });

  Service.associate = (models) => {
    Service.belongsToMany(models.AnimalType, {
      through: 'ServiceAnimalType',
      foreignKey: 'serviceId',
      otherKey: 'animalTypeId'
    });
    Service.belongsToMany(models.Occurence, {
      through: 'OccurenceServices',
      as: 'occurences',
      foreignKey: 'serviceId',
      otherKey: 'occurenceId',
      timestamps: false
    });
    Service.hasMany(models.OfferServiceOccurence, {
      foreignKey: 'serviceId',
      as: 'offerServiceOccurences'
    });
  };

  return Service;
};