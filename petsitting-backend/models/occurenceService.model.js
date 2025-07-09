const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OccurenceService = sequelize.define('OccurenceService', {
    occurenceId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Occurences',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    serviceId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Services',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
    // Tu peux ajouter d'autres colonnes ici si nécessaire (ex: createdAt, importance, etc.)
  }, {
    timestamps: false, // ou true si tu veux createdAt/updatedAt
    tableName: 'OccurenceServices'
  });

  return OccurenceService;
};