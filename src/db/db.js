const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('../utils/helper/pino-logger');
dotenv.config();

//get db url form .env
const dbUrl = process.env.DB_URL;

// connect to database
const connectToDatabase = async () => {
  try {
    await mongoose.connect(dbUrl, { dbName: process.env.DB_NAME });
    logger.info('Connected to the database');
  } catch (error) {
    logger.error({ message: error.message }, 'Error connecting to the database');
    logger.info('Error connecting to the database:', error.message);
    process.exit(1); // Exit the application if unable to connect to the database
  }
};

// handle disconnection
const disconnectFromDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from the database');
  } catch (error) {
    logger.info('Error disconnecting from the database:', error.message);
    logger.error({ message: error.message }, 'Error disconnecting from the database');
  }
};

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
};
