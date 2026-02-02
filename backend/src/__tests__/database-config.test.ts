import 'reflect-metadata';
import { connectMySQL, disconnectMySQL, connectMongoDB, disconnectMongoDB, getDatabaseStatus, MySQLDataSource } from '../config/database';
import mongoose from 'mongoose';

describe('Database Configuration', () => {
  describe('MySQL Connection', () => {
    it('should connect to SQLite in-memory database in test environment', async () => {
      await connectMySQL();
      expect(MySQLDataSource.isInitialized).toBe(true);
      expect(MySQLDataSource.options.type).toBe('better-sqlite3');
    });

    it('should disconnect from MySQL', async () => {
      await disconnectMySQL();
      expect(MySQLDataSource.isInitialized).toBe(false);
    });
  });

  describe('MongoDB Connection', () => {
    it('should handle MongoDB connection in test environment', async () => {
      // In test environment, MongoDB connection is handled by mongodb-memory-server
      const result = await connectMongoDB();
      expect(result).toBeDefined();
    });

    it('should disconnect from MongoDB', async () => {
      await disconnectMongoDB();
      expect(mongoose.connection.readyState).toBe(0);
    });
  });

  describe('Database Status', () => {
    beforeAll(async () => {
      await connectMySQL();
      await connectMongoDB();
    });

    afterAll(async () => {
      await disconnectMySQL();
      await disconnectMongoDB();
    });

    it('should return correct database status', () => {
      const status = getDatabaseStatus();
      expect(status).toHaveProperty('mysql');
      expect(status).toHaveProperty('mongodb');
      expect(typeof status.mysql).toBe('boolean');
      expect(typeof status.mongodb).toBe('boolean');
    });
  });
});
