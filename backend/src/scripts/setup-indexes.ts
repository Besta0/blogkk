import 'reflect-metadata';
import '@dotenvx/dotenvx/config';
import { connectDatabases, disconnectDatabases } from '../config/database';
import { PageView, ProjectInteraction, FileMetadata, SystemLog } from '../models/analytics.model';

async function setupIndexes() {
  try {
    console.log('📊 Setting up database indexes...');
    
    await connectDatabases();
    console.log('✅ Connected to databases');

    // MySQL indexes are handled by TypeORM synchronize
    console.log('✅ MySQL indexes are managed by TypeORM');

    // MongoDB indexes - ensure they are created
    console.log('📊 Creating MongoDB indexes...');
    
    await PageView.createIndexes();
    console.log('   ✅ PageView indexes created');
    
    await ProjectInteraction.createIndexes();
    console.log('   ✅ ProjectInteraction indexes created');
    
    await FileMetadata.createIndexes();
    console.log('   ✅ FileMetadata indexes created');
    
    await SystemLog.createIndexes();
    console.log('   ✅ SystemLog indexes created');

    console.log('\n🎉 All indexes set up successfully!');
    
  } catch (error) {
    console.error('❌ Failed to setup indexes:', error);
    process.exit(1);
  } finally {
    await disconnectDatabases();
    process.exit(0);
  }
}

setupIndexes();
