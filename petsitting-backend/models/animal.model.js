const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Animal = sequelize.define('Animal', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false, // obligatoire
      references: {
        model: 'Users', // table Users
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    animalTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false, // obligatoire
      references: {
        model: 'AnimalTypes', // table AnimalTypes
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  });

  Animal.associate = (models) => {
    Animal.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      as: 'owner',
    });

    Animal.belongsTo(models.AnimalType, {
      foreignKey: 'animalTypeId',
      onDelete: 'CASCADE',
      as: 'animalType',
    });
  };

  return Animal;
};