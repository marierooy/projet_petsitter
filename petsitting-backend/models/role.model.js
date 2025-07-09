const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Role = sequelize.define("Role", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: { type: DataTypes.STRING }
    });

    Role.associate = (models) => {
        Role.belongsToMany(models.User, {
            through: "user_roles",
            foreignKey: "role_id",
            otherKey: "user_id"
        });
    };
    return Role;
};