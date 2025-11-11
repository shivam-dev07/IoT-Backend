/**
 * BlazeIoT Solutions - Admin User Seeder
 * Run this script to create or reset admin user
 */

const readline = require('readline');
const dbService = require('../src/services/database.service');
const authService = require('../src/services/auth.service');
const config = require('../src/config/config');
const logger = require('../src/utils/logger');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function seedAdmin() {
  try {
    await dbService.connect();

    console.log('\n='.repeat(60));
    console.log('BlazeIoT Solutions - Admin User Setup');
    console.log('='.repeat(60));

    const username = await question(`\nAdmin Username (default: ${config.admin.username}): `) || config.admin.username;
    const email = await question(`Admin Email (default: ${config.admin.email}): `) || config.admin.email;
    const password = await question(`Admin Password (default: ${config.admin.password}): `) || config.admin.password;

    console.log('\nCreating admin user...');

    // Check if user exists
    const existingUser = await dbService.getUserByUsername(username);
    
    if (existingUser) {
      const overwrite = await question('User already exists. Overwrite? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('❌ Aborted');
        rl.close();
        await dbService.close();
        process.exit(0);
      }
      
      // Delete existing user
      await dbService.query('DELETE FROM users WHERE username = ?', [username]);
      logger.info('Existing user removed');
    }

    // Create new admin user
    const result = await authService.createAdminUser(username, password, email);

    if (result.success) {
      console.log('\n✅ Admin user created successfully!');
      console.log('\nCredentials:');
      console.log(`  Username: ${username}`);
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
      console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    } else {
      console.log(`\n❌ Failed: ${result.message}`);
    }

    rl.close();
    await dbService.close();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error creating admin user:', error);
    rl.close();
    await dbService.close();
    process.exit(1);
  }
}

seedAdmin();
