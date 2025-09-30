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


  // ✅ Vérification petsitterId
  Availability.beforeValidate((availability) => {
    if (!availability.petsitterId) {
      throw new Error('petsitterId est obligatoire');
    }
  });

  // ✅ Vérification availabilityTypeId
  Availability.beforeValidate((availability) => {
    if (!availability.availabilityTypeId) {
      throw new Error('availabilityTypeId est obligatoire');
    }
  });

  // ✅ Vérification startDate < endDate
  Availability.beforeValidate((availability) => {
    if (
      availability.start_date &&
      availability.end_date &&
      new Date(availability.start_date) > new Date(availability.end_date)
    ) {
      throw new Error('La date de début doit être antérieure ou égale à la date de fin');
    }
  });

  Availability.associate = (models) => {
    Availability.belongsTo(models.User, {
      foreignKey: 'petsitterId',
      onDelete: 'CASCADE',
      as: 'petsitter'
    });
    Availability.belongsTo(models.AvailabilityType, { 
      foreignKey: 'availabilityTypeId',
      onDelete: 'CASCADE',
      as: 'availabilityType'
    });
    Availability.hasMany(models.Offer, {
      foreignKey: 'availabilityId',
      as: 'offers'
    });
  };

  return Availability;
};