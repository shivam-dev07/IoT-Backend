/**
 * Clear MongoDB Collections
 * Use this to reset MongoDB database
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blazeiot';

async function clearDatabase() {
  console.log('🗑️  Clearing MongoDB database...\n');

  const mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  const dbName = new URL(MONGODB_URI).pathname.slice(1) || 'blazeiot';
  const mongodb = mongoClient.db(dbName);
  console.log(`✅ Connected to MongoDB: ${dbName}\n`);

  try {
    const collections = [
      'users',
      'devices',
      'gateways',
      'nodes',
      'sensor_data',
      'commands',
      'ota_updates',
      'system_logs'
    ];

    for (const collectionName of collections) {
      try {
        await mongodb.collection(collectionName).deleteMany({});
        console.log(`✅ Cleared ${collectionName}`);
      } catch (error) {
        console.log(`ℹ️  Collection ${collectionName} doesn't exist (skipping)`);
      }
    }

    // Drop indexes
    for (const collectionName of collections) {
      try {
        await mongodb.collection(collectionName).dropIndexes();
        console.log(`✅ Dropped indexes for ${collectionName}`);
      } catch (error) {
        // Ignore errors
      }
    }

    console.log('\n🎉 MongoDB database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await mongoClient.close();
    console.log('✅ Connection closed');
  }
}

clearDatabase().catch(console.error);
