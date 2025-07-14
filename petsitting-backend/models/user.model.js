const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    postal_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    presentation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    photo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    habitation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    habitation_size: {
      type: DataTypes.FLOAT,
      allowNull: true
    }, 
    number_rooms: {
      type: DataTypes.INTEGER,
      allowNull: true
    }, 
    garden: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },   
    garden_size: {
      type: DataTypes.FLOAT,
      allowNull: true
    },  
    terrace: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },    
    yard: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },   
    balcony: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },  
    number_children: {
      type: DataTypes.INTEGER,
      allowNull: true
    }, 
  }, {
    timestamps: true,
  });

  User.associate = (models) => {
    User.belongsToMany(models.Role, {
      through: "user_roles",
      foreignKey: "user_id",
      otherKey: "role_id"
    });
    User.hasMany(models.Offer, {
      foreignKey: 'petsitterId',
      as: 'offers'
    });
  };
  return User;
};
