import 'reflect-metadata';
import '@dotenvx/dotenvx/config';
import { connectDatabases, disconnectDatabases } from '../config/database';
import { checkDatabaseConsistency, verifyDataIntegrity } from '../utils/consistency';

async function runConsistencyCheck() {
  try {
    console.log('🔍 Running database consistency check...\n');
    
    await connectDatabases();
    console.log('✅ Connected to databases\n');

    // Check database consistency
    console.log('📊 Database Status:');
    console.log('─'.repeat(50));
    
    const consistency = await checkDatabaseConsistency();
    
    console.log(`MySQL: ${consistency.mysql.connected ? '✅ Connected' : '❌ Disconnected'}`);
    if (consistency.mysql.tables.length > 0) {
      console.log(`   Tables: ${consistency.mysql.tables.join(', ')}`);
    }
    
    console.log(`MongoDB: ${consistency.mongodb.connected ? '✅ Connected' : '❌ Disconnected'}`);
    if (consistency.mongodb.collections.length > 0) {
      console.log(`   Collections: ${consistency.mongodb.collections.join(', ')}`);
    }
    
    if (consistency.issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      consistency.issues.forEach(issue => console.log(`   - ${issue}`));
    }

    // Verify data integrity
    console.log('\n📋 Data Integrity Check:');
    console.log('─'.repeat(50));
    
    const integrity = await verifyDataIntegrity();
    
    integrity.checks.forEach(check => {
      const icon = check.passed ? '✅' : '❌';
      console.log(`${icon} ${check.name}: ${check.message}`);
    });

    console.log('\n' + '─'.repeat(50));
    console.log(`Overall Status: ${integrity.valid ? '✅ All checks passed' : '⚠️  Some checks failed'}`);
    
  } catch (error) {
    console.error('❌ Consistency check failed:', error);
    process.exit(1);
  } finally {
    await disconnectDatabases();
    process.exit(0);
  }
}

runConsistencyCheck();
