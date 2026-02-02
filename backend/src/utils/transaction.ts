import { MySQLDataSource } from '../config/database';
import { QueryRunner } from 'typeorm';

/**
 * Execute a function within a MySQL transaction
 */
export async function withTransaction<T>(
  fn: (queryRunner: QueryRunner) => Promise<T>
): Promise<T> {
  const queryRunner = MySQLDataSource.createQueryRunner();
  
  await queryRunner.connect();
  await queryRunner.startTransaction();
  
  try {
    const result = await fn(queryRunner);
    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}

/**
 * Execute multiple operations atomically
 */
export async function executeAtomic<T>(
  operations: (() => Promise<T>)[]
): Promise<T[]> {
  return withTransaction(async () => {
    const results: T[] = [];
    for (const operation of operations) {
      results.push(await operation());
    }
    return results;
  });
}
