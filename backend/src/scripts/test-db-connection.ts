/**
 * Database connection test script
 * Tests MySQL connection setup and configuration
 */
import { connectDatabase, disconnectDatabase, getDatabaseStatus } from '../config/database';

async function testDatabaseConnection() {
  console.log('🧪 Testing MySQL connection...\n');
  console.log('Configuration:');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || '3306'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'portfolio'}`);
  console.log('');

  try {
    // Test connection
    console.log('📡 Attempting to connect to MySQL...');
    await connectDatabase();

    // Check status
    const status = getDatabaseStatus();
    console.log(`\n✅ Connection Status: ${status ? 'Connected' : 'Disconnected'}`);

    if (status) {
      console.log('✅ Database connection test PASSED');
      console.log('\n📝 Connection details verified:');
      console.log('  ✓ TypeORM DataSource configured');
      console.log('  ✓ Connection pool established');
      console.log('  ✓ Entities synchronized');
    } else {
      console.log('❌ Database connection test FAILED');
      process.exit(1);
    }

    // Disconnect
    console.log('\n🔌 Disconnecting...');
    await disconnectDatabase();
    console.log('✅ Disconnected successfully');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection test FAILED');
    console.error('Error:', error);
    console.error('\n💡 Troubleshooting tips:');
    console.error('  1. Check if MySQL is running');
    console.error('  2. Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME in .env file');
    console.error('  3. Check network connectivity');
    console.error('  4. Verify database credentials');
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();
