const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AnimalType = sequelize.define('AnimalType', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  AnimalType.associate = (models) => {
    AnimalType.hasMany(models.Animal, {
      foreignKey: 'animalTypeId',
      as: 'animals',
    });
    AnimalType.belongsToMany(models.Service, {
      through: 'ServiceAnimalType',
      foreignKey: 'animalTypeId',
      otherKey: 'serviceId',
      as: 'services',
    });
    AnimalType.hasMany(models.Offer, {
      foreignKey: 'animalTypeId',
      as: 'offers'
    });
  };

  return AnimalType;
};