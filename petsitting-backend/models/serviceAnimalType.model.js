const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ServiceAnimalType = sequelize.define('ServiceAnimalType', {
    serviceId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Services',
        key: 'id',
      }
    },
    animalTypeId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'AnimalTypes',
        key: 'id',
      }
    }
  });

  return ServiceAnimalType;
};