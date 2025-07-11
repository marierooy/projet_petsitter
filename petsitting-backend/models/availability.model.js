const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Availability = sequelize.define('Availability', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    petsitterId: {
      type: DataTypes.INTEGER,
      allowNull: true, // ou false si tu veux le rendre obligatoire, mais attention aux données existantes
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    availabilityTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true, // ou false si obligatoire
      references: {
        model: 'AvailabilityTypes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    }
  }, {
    tableName: 'Availabilities',
    timestamps: true // Si tu veux createdAt et updatedAt
  });

  Availability.associate = (models) => {
    Availability.belongsTo(models.User, {
      foreignKey: 'petsitterId',
      as: 'petsitter'
    });
    Availability.belongsTo(models.AvailabilityType, { 
      foreignKey: 'availabilityTypeId',
      as: 'type'
    });
    Availability.hasMany(models.Offer, {
      foreignKey: 'availabilityId',
      as: 'offers'
    });
  };

  return Availability;
};