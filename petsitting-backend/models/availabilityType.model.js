const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AvailabilityType = sequelize.define('AvailabilityType', {
    label: DataTypes.STRING,
    color: DataTypes.STRING,
    petsitterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' }
    }
  });

  AvailabilityType.associate = models => {
    AvailabilityType.belongsTo(models.User, {
      foreignKey: 'petsitterId',
      as: 'petsitter'
    });
    AvailabilityType.hasMany(models.Availability, {
       foreignKey: 'availabilityTypeId',
       as: 'availabilities'
    });
  };

  return AvailabilityType;
};