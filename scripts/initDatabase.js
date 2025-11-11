/**
 * BlazeIoT Solutions - Database Initialization Script
 * Run this script to initialize the database schema
 */

const dbService = require('../src/services/database.service');
const logger = require('../src/utils/logger');

async function initDatabase() {
  try {
    logger.info('Initializing database...');
    
    await dbService.connect();
    
    logger.info('✅ Database initialized successfully');
    logger.info('Schema created with all tables and indexes');
    
    await dbService.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
