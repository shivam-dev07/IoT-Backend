/**
 * BlazeIoT Solutions - Database Service
 * Routes to MongoDB service
 */

const config = require('../config/config');

// Route to MongoDB service
if (config.database.type === 'mongodb') {
  module.exports = require('./database.mongodb.service');
} else {
  throw new Error(`Unsupported database type: ${config.database.type}. Only MongoDB is supported.`);
}
