import '@dotenvx/dotenvx/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// TypeORM Entities (will be imported after creation)
import { User } from '../models/user.model';
import { Profile } from '../models/profile.model';
import { Project } from '../models/project.model';
import { BlogPost } from '../models/blogPost.model';
import { ContactMessage } from '../models/contactMessage.model';
import { Newsletter } from '../models/newsletter.model';
import { RefreshToken } from '../models/refreshToken.model';

const isTest = process.env.NODE_ENV === 'test';

// MongoDB Memory Server instance for testing
let mongoServer: MongoMemoryServer | null = null;

// MySQL DataSource (TypeORM) - for structured data
export const MySQLDataSource = new DataSource({
  type: isTest ? 'better-sqlite3' : 'mysql',
  host: isTest ? undefined : process.env.DB_HOST || 'localhost',
  port: isTest ? undefined : parseInt(process.env.DB_PORT || '3306'),
  username: isTest ? undefined : process.env.DB_USER || 'root',
  password: isTest ? undefined : process.env.DB_PASSWORD || '',
  database: isTest ? ':memory:' : process.env.DB_NAME || 'portfolio',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development' ? ['query', 'error'] : false,
  entities: [User, Profile, Project, BlogPost, ContactMessage, Newsletter, RefreshToken],
});

// Connect to MySQL
export async function connectMySQL(): Promise<DataSource> {
  try {
    if (!MySQLDataSource.isInitialized) {
      await MySQLDataSource.initialize();
      console.log('✅ MySQL connected successfully');
      console.log(`📍 MySQL Database: ${isTest ? 'SQLite (in-memory)' : process.env.DB_NAME || 'portfolio'}`);
    }
    return MySQLDataSource;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    throw error;
  }
}

// Connect to MongoDB
export async function connectMongoDB(): Promise<typeof mongoose> {
  try {
    // Use mongodb-memory-server in test environment
    if (isTest) {
      if (!mongoServer) {
        mongoServer = await MongoMemoryServer.create();
      }
      const mongoUri = mongoServer.getUri();
      
      // Only connect if not already connected
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected: In-memory test server');
      }
      return mongoose;
    }
    
    // Production/development MongoDB connection
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio_analytics';
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`📍 MongoDB Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

// Connect to both databases
export async function connectDatabases(): Promise<void> {
  await Promise.all([
    connectMySQL(),
    connectMongoDB(),
  ]);
  console.log('✅ All databases connected');
}

// Disconnect from MySQL
export async function disconnectMySQL(): Promise<void> {
  if (MySQLDataSource.isInitialized) {
    await MySQLDataSource.destroy();
    console.log('📤 MySQL disconnected');
  }
}

// Disconnect from MongoDB
export async function disconnectMongoDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('📤 MongoDB disconnected');
  }
  
  // Stop mongodb-memory-server in test environment
  if (isTest && mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}

// Disconnect from both databases
export async function disconnectDatabases(): Promise<void> {
  await Promise.all([
    disconnectMySQL(),
    disconnectMongoDB(),
  ]);
}

// Get database status
export function getDatabaseStatus(): { mysql: boolean; mongodb: boolean } {
  return {
    mysql: MySQLDataSource.isInitialized,
    mongodb: mongoose.connection.readyState === 1,
  };
}

// Legacy exports for backward compatibility
export const connectDatabase = connectDatabases;
export const disconnectDatabase = disconnectDatabases;
