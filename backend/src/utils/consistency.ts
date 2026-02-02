import { MySQLDataSource } from '../config/database';
import mongoose from 'mongoose';

/**
 * Check database consistency between MySQL and MongoDB
 */
export async function checkDatabaseConsistency(): Promise<{
  mysql: { connected: boolean; tables: string[] };
  mongodb: { connected: boolean; collections: string[] };
  issues: string[];
}> {
  const issues: string[] = [];
  
  // Check MySQL
  let mysqlConnected = false;
  let mysqlTables: string[] = [];
  
  try {
    if (MySQLDataSource.isInitialized) {
      mysqlConnected = true;
      const tables = await MySQLDataSource.query('SHOW TABLES');
      mysqlTables = tables.map((t: Record<string, string>) => Object.values(t)[0]);
    } else {
      issues.push('MySQL is not connected');
    }
  } catch (error) {
    issues.push(`MySQL error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Check MongoDB
  let mongoConnected = false;
  let mongoCollections: string[] = [];
  
  try {
    if (mongoose.connection.readyState === 1) {
      mongoConnected = true;
      const collections = await mongoose.connection.db?.listCollections().toArray();
      mongoCollections = collections?.map(c => c.name) || [];
    } else {
      issues.push('MongoDB is not connected');
    }
  } catch (error) {
    issues.push(`MongoDB error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    mysql: { connected: mysqlConnected, tables: mysqlTables },
    mongodb: { connected: mongoConnected, collections: mongoCollections },
    issues,
  };
}

/**
 * Verify data integrity
 */
export async function verifyDataIntegrity(): Promise<{
  valid: boolean;
  checks: { name: string; passed: boolean; message: string }[];
}> {
  const checks: { name: string; passed: boolean; message: string }[] = [];
  
  // Check MySQL tables exist
  try {
    const expectedTables = ['users', 'profiles', 'projects', 'blog_posts', 'contact_messages', 'newsletters', 'refresh_tokens'];
    const result = await MySQLDataSource.query('SHOW TABLES');
    const existingTables = result.map((t: Record<string, string>) => Object.values(t)[0]);
    
    for (const table of expectedTables) {
      const exists = existingTables.includes(table);
      checks.push({
        name: `MySQL table: ${table}`,
        passed: exists,
        message: exists ? 'Table exists' : 'Table missing',
      });
    }
  } catch (error) {
    checks.push({
      name: 'MySQL tables check',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
  
  // Check MongoDB collections exist
  try {
    const expectedCollections = ['pageviews', 'projectinteractions', 'filemetadatas', 'systemlogs'];
    const collections = await mongoose.connection.db?.listCollections().toArray();
    const existingCollections = collections?.map(c => c.name.toLowerCase()) || [];
    
    for (const collection of expectedCollections) {
      const exists = existingCollections.includes(collection);
      checks.push({
        name: `MongoDB collection: ${collection}`,
        passed: exists,
        message: exists ? 'Collection exists' : 'Collection will be created on first insert',
      });
    }
  } catch (error) {
    checks.push({
      name: 'MongoDB collections check',
      passed: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
  
  const valid = checks.every(c => c.passed);
  
  return { valid, checks };
}
