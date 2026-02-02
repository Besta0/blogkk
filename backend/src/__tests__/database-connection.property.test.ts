/**
 * Property-Based Tests for Database Connection Lifecycle
 * Feature: hybrid-database-migration
 * Property 1: 数据库连接生命周期
 * 
 * Validates: Requirements 1.1, 1.5, 4.1, 4.3
 */

import 'reflect-metadata';
import * as fc from 'fast-check';
import { 
  connectDatabases, 
  disconnectDatabases, 
  getDatabaseStatus,
  connectMySQL,
  disconnectMySQL,
  connectMongoDB,
  disconnectMongoDB
} from '../config/database';

describe('Property 1: 数据库连接生命周期', () => {
  afterEach(async () => {
    // Ensure cleanup after each test
    try {
      await disconnectDatabases();
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  it('should maintain correct connection status through connect/disconnect cycles', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }), // Number of connect/disconnect cycles
        async (cycles) => {
          for (let i = 0; i < cycles; i++) {
            // Connect to databases
            await connectDatabases();
            
            // Verify both databases are connected
            const connectedStatus = getDatabaseStatus();
            expect(connectedStatus.mysql).toBe(true);
            expect(connectedStatus.mongodb).toBe(true);
            
            // Disconnect from databases
            await disconnectDatabases();
            
            // Verify both databases are disconnected
            const disconnectedStatus = getDatabaseStatus();
            expect(disconnectedStatus.mysql).toBe(false);
            expect(disconnectedStatus.mongodb).toBe(false);
          }
        }
      ),
      { numRuns: 10 } // Run 10 iterations
    );
  });

  it('should handle individual database connection lifecycle independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('mysql', 'mongodb'),
        async (dbType) => {
          if (dbType === 'mysql') {
            // Test MySQL lifecycle
            await connectMySQL();
            const status1 = getDatabaseStatus();
            expect(status1.mysql).toBe(true);
            
            await disconnectMySQL();
            const status2 = getDatabaseStatus();
            expect(status2.mysql).toBe(false);
          } else {
            // Test MongoDB lifecycle
            await connectMongoDB();
            const status1 = getDatabaseStatus();
            expect(status1.mongodb).toBe(true);
            
            await disconnectMongoDB();
            const status2 = getDatabaseStatus();
            expect(status2.mongodb).toBe(false);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should maintain idempotency for connect operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }),
        async (connectAttempts) => {
          // Multiple connect calls should not cause errors
          for (let i = 0; i < connectAttempts; i++) {
            await connectDatabases();
          }
          
          const status = getDatabaseStatus();
          expect(status.mysql).toBe(true);
          expect(status.mongodb).toBe(true);
          
          // Cleanup
          await disconnectDatabases();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should maintain idempotency for disconnect operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }),
        async (disconnectAttempts) => {
          // Connect first
          await connectDatabases();
          
          // Multiple disconnect calls should not cause errors
          for (let i = 0; i < disconnectAttempts; i++) {
            await disconnectDatabases();
          }
          
          const status = getDatabaseStatus();
          expect(status.mysql).toBe(false);
          expect(status.mongodb).toBe(false);
        }
      ),
      { numRuns: 10 }
    );
  });
});
