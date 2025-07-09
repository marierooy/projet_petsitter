const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    dialectOptions: {
      charset: 'utf8mb4',
    },
    logging: false,
  }
);

module.exports = sequelize;