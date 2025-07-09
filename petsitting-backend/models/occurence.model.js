const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Occurence = sequelize.define('Occurence', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
  });
  Occurence.associate = (models) => {
    Occurence.belongsToMany(models.Service, {
      through: 'OccurenceServices',
      as: 'services',
      foreignKey: 'occurenceId',
      otherKey: 'serviceId',
      timestamps: false
    });

    Occurence.hasMany(models.OfferServiceOccurence, {
      foreignKey: 'occurenceId',
      as: 'offerServiceOccurences'
    });
  };
  return Occurence;
};