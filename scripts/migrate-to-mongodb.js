/**
 * SQLite to MongoDB Migration Script
 * Migrates all data from SQLite to MongoDB Atlas
 */

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { MongoClient } = require('mongodb');
const path = require('path');

// Configuration
const SQLITE_PATH = process.env.SQLITE_DB_PATH || './data/blazeiot.db';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blazeiot';

async function migrate() {
  console.log('🔄 Starting SQLite to MongoDB migration...\n');

  // Connect to SQLite
  const sqliteDb = new sqlite3.Database(SQLITE_PATH, (err) => {
    if (err) {
      console.error('❌ SQLite connection failed:', err);
      process.exit(1);
    }
  });

  // Connect to MongoDB
  const mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  const dbName = new URL(MONGODB_URI).pathname.slice(1) || 'blazeiot';
  const mongodb = mongoClient.db(dbName);
  console.log(`✅ Connected to MongoDB: ${dbName}\n`);

  try {
    // Helper function to get SQLite data
    const getSQLiteData = (query) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(query, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };

    // 1. Migrate Users
    console.log('📊 Migrating users...');
    const users = await getSQLiteData('SELECT * FROM users');
    if (users.length > 0) {
      const usersToInsert = users.map(user => ({
        ...user,
        created_at: new Date(user.created_at || Date.now()),
        _id: undefined, // Let MongoDB generate new _id
        id: undefined,  // Remove SQLite id
      }));
      await mongodb.collection('users').insertMany(usersToInsert);
      console.log(`✅ Migrated ${users.length} users`);
    } else {
      console.log('ℹ️  No users to migrate');
    }

    // 2. Migrate Devices
    console.log('📊 Migrating devices...');
    const devices = await getSQLiteData('SELECT * FROM devices');
    if (devices.length > 0) {
      const devicesToInsert = devices.map(device => ({
        ...device,
        last_seen: new Date(device.last_seen || Date.now()),
        created_at: new Date(device.created_at || Date.now()),
        _id: undefined,
        id: undefined,
      }));
      await mongodb.collection('devices').insertMany(devicesToInsert);
      console.log(`✅ Migrated ${devices.length} devices`);
    } else {
      console.log('ℹ️  No devices to migrate');
    }

    // 3. Migrate Gateways
    console.log('📊 Migrating gateways...');
    const gateways = await getSQLiteData('SELECT * FROM gateways');
    if (gateways.length > 0) {
      const gatewaysToInsert = gateways.map(gateway => ({
        ...gateway,
        last_seen: new Date(gateway.last_seen || Date.now()),
        created_at: new Date(gateway.created_at || Date.now()),
        _id: undefined,
        id: undefined,
      }));
      await mongodb.collection('gateways').insertMany(gatewaysToInsert);
      console.log(`✅ Migrated ${gateways.length} gateways`);
    } else {
      console.log('ℹ️  No gateways to migrate');
    }

    // 4. Migrate Nodes
    console.log('📊 Migrating nodes...');
    const nodes = await getSQLiteData('SELECT * FROM nodes');
    if (nodes.length > 0) {
      const nodesToInsert = nodes.map(node => ({
        ...node,
        last_seen: new Date(node.last_seen || Date.now()),
        created_at: new Date(node.created_at || Date.now()),
        _id: undefined,
        id: undefined,
      }));
      await mongodb.collection('nodes').insertMany(nodesToInsert);
      console.log(`✅ Migrated ${nodes.length} nodes`);
    } else {
      console.log('ℹ️  No nodes to migrate');
    }

    // 5. Migrate Sensor Data (in batches to avoid memory issues)
    console.log('📊 Migrating sensor data...');
    const BATCH_SIZE = 1000;
    let offset = 0;
    let totalMigrated = 0;

    while (true) {
      const sensorData = await getSQLiteData(`SELECT * FROM sensor_data LIMIT ${BATCH_SIZE} OFFSET ${offset}`);
      if (sensorData.length === 0) break;

      const dataToInsert = sensorData.map(data => ({
        ...data,
        data: typeof data.data === 'string' ? JSON.parse(data.data) : data.data,
        timestamp: new Date(data.timestamp || Date.now()),
        created_at: new Date(data.created_at || Date.now()),
        _id: undefined,
        id: undefined,
      }));

      await mongodb.collection('sensor_data').insertMany(dataToInsert);
      totalMigrated += sensorData.length;
      console.log(`  📦 Migrated ${totalMigrated} sensor data records...`);
      offset += BATCH_SIZE;
    }
    console.log(`✅ Migrated ${totalMigrated} total sensor data records`);

    // 6. Migrate Commands
    console.log('📊 Migrating commands...');
    try {
      const commands = await getSQLiteData('SELECT * FROM commands');
      if (commands.length > 0) {
        const commandsToInsert = commands.map(cmd => ({
          ...cmd,
          parameters: typeof cmd.parameters === 'string' ? JSON.parse(cmd.parameters) : cmd.parameters,
          response: typeof cmd.response === 'string' ? JSON.parse(cmd.response) : cmd.response,
          created_at: new Date(cmd.created_at || Date.now()),
          updated_at: cmd.updated_at ? new Date(cmd.updated_at) : undefined,
          _id: undefined,
          id: undefined,
        }));
        await mongodb.collection('commands').insertMany(commandsToInsert);
        console.log(`✅ Migrated ${commands.length} commands`);
      } else {
        console.log('ℹ️  No commands to migrate');
      }
    } catch (error) {
      console.log('ℹ️  Commands table not found (skipping)');
    }

    // 7. Migrate OTA Updates
    console.log('📊 Migrating OTA updates...');
    try {
      const otaUpdates = await getSQLiteData('SELECT * FROM ota_updates');
      if (otaUpdates.length > 0) {
        const otaToInsert = otaUpdates.map(ota => ({
          ...ota,
          created_at: new Date(ota.created_at || Date.now()),
          updated_at: ota.updated_at ? new Date(ota.updated_at) : undefined,
          _id: undefined,
          id: undefined,
        }));
        await mongodb.collection('ota_updates').insertMany(otaToInsert);
        console.log(`✅ Migrated ${otaUpdates.length} OTA updates`);
      } else {
        console.log('ℹ️  No OTA updates to migrate');
      }
    } catch (error) {
      console.log('ℹ️  OTA updates table not found (skipping)');
    }

    // 8. Migrate System Logs
    console.log('📊 Migrating system logs...');
    offset = 0;
    totalMigrated = 0;

    try {
      while (true) {
        const logs = await getSQLiteData(`SELECT * FROM system_logs LIMIT ${BATCH_SIZE} OFFSET ${offset}`);
        if (logs.length === 0) break;

        const logsToInsert = logs.map(log => ({
          ...log,
          details: typeof log.details === 'string' ? JSON.parse(log.details) : log.details,
          timestamp: new Date(log.timestamp || Date.now()),
          _id: undefined,
          id: undefined,
        }));

        await mongodb.collection('system_logs').insertMany(logsToInsert);
        totalMigrated += logs.length;
        console.log(`  📦 Migrated ${totalMigrated} system logs...`);
        offset += BATCH_SIZE;
      }
      console.log(`✅ Migrated ${totalMigrated} total system logs`);
    } catch (error) {
      console.log('ℹ️  System logs table not found (skipping)');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Devices: ${devices.length}`);
    console.log(`   - Gateways: ${gateways.length}`);
    console.log(`   - Nodes: ${nodes.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close connections
    sqliteDb.close();
    await mongoClient.close();
    console.log('\n✅ Database connections closed');
  }
}

// Run migration
migrate().catch(console.error);
