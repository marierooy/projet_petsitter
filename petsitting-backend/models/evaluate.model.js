const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Evaluate = sequelize.define('Evaluate', {
    comment: { type: DataTypes.TEXT, allowNull: false },
    rate: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'evaluates',
    timestamps: true
  });

  Evaluate.associate = (models) => {
    Evaluate.belongsTo(models.Contract, { foreignKey: 'contract_id', as: 'contract' });
    Evaluate.belongsTo(models.User, { foreignKey: 'user_id', as: 'author' }); // owner
    Evaluate.belongsTo(models.User, { foreignKey: 'target_user_id', as: 'target' }); // petsitter
  };

  return Evaluate;
};