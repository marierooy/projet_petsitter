module.exports = (sequelize, DataTypes) => {
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
    },
  });

  Animal.associate = (models) => {
    Animal.belongsTo(models.AnimalType, {
      foreignKey: 'animalTypeId',
      as: 'animalType',
    });

    Animal.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'owner',
    });
  };

  return Animal;
};