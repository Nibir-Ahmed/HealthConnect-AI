require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

let sequelize;

if (process.env.DB_DIALECT === 'sqlite' || process.env.USE_SQLITE === 'true' || (!process.env.DB_HOST && process.env.NODE_ENV === 'production')) {
  console.log('ℹ️ Using SQLite database for cloud deployment.');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false,
  });
} else if (process.env.DB_HOST && process.env.DB_HOST !== '127.0.0.1') {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'healthconnect',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || 'password',
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT || 'mysql',
      logging: false,
    }
  );
} else {
  // Default fallback for cloud or local
  console.log('ℹ️ Defaulting to SQLite database for portable deployment.');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database.sqlite'),
    logging: false,
  });
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };
