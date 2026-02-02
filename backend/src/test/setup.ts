import 'reflect-metadata';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { MySQLDataSource, connectMySQL, disconnectMySQL } from '../config/database';
import { setupTestDatabases, teardownTestDatabases, clearAllData } from '../__tests__/setup';

// Set test environment
process.env.NODE_ENV = 'test';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  await setupTestDatabases();
});

afterAll(async () => {
  await teardownTestDatabases();
});

beforeEach(async () => {
  await clearAllData();
});

export { MySQLDataSource, mongoServer };
