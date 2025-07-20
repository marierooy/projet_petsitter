const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Advert = sequelize.define('Advert', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY
  });

  Advert.associate = (models) => {
    Advert.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'owner'
    });

    Advert.belongsTo(models.Animal, {
      foreignKey: 'animalId',
      as: 'animal'
    });

    Advert.belongsTo(models.CareMode, {
      foreignKey: 'careModeId',
      as: 'careMode'
    });

    Advert.hasMany(models.AdvertServiceOccurence, {
        foreignKey: 'advertId',
        as: 'advertServiceOccurences', // ⚠️ doit correspondre à ce que tu utilises dans le `include`
        onDelete: 'CASCADE',   // ⬅️ supprime automatiquement les occurrences liées
        hooks: true
    });
  };

  return Advert;
};