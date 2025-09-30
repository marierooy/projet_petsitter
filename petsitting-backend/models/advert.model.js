const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Advert = sequelize.define('Advert', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false // ✅ obligatoire
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false // ✅ obligatoire
    }
  });

    // ✅ Vérification startDate < endDate
  Advert.beforeValidate((advert) => {
    if (
      advert.startDate &&
      advert.endDate &&
      new Date(advert.startDate) > new Date(advert.endDate)
    ) {
      throw new Error('La date de début doit être antérieure ou égale à la date de fin');
    }
  });

  Advert.associate = (models) => {
    Advert.belongsTo(models.User, {
      foreignKey: {
        name: 'userId',
        allowNull: false, // un Advert doit être lié à un User
      },
      as: 'owner'
    });

    Advert.belongsTo(models.Animal, {
      foreignKey: {
        name: 'animalId',
        allowNull: false, // animalId obligatoire
      },
      as: 'animal'
    });

    Advert.belongsTo(models.CareMode, {
      foreignKey: {
        name: 'careModeId',
        allowNull: false, // careModeId obligatoire
      },
      as: 'careMode'
    });


    Advert.hasMany(models.AdvertServiceOccurence, {
        foreignKey: 'advertId',
        as: 'advertServiceOccurences', // ⚠️ doit correspondre à ce que tu utilises dans le `include`
        onDelete: 'CASCADE',   // ⬅️ supprime automatiquement les occurrences liées
        hooks: true
    });
    Advert.hasMany(models.AdvertOfferContract, { foreignKey: 'advert_id' });
  };

  return Advert;
};