# Test Utilities

This directory contains test utilities and helper functions for the hybrid database migration test suite.

## Overview

The test environment is configured to use:
- **SQLite (in-memory)** for MySQL/TypeORM tests
- **mongodb-memory-server** for MongoDB/Mongoose tests

This allows tests to run quickly without requiring external database services.

## Setup File (`setup.ts`)

The `setup.ts` file provides utility functions for managing test databases and creating test data.

### Database Management Functions

#### `setupTestDatabases()`
Initializes both MySQL (SQLite in-memory) and MongoDB (memory server) connections.

```typescript
await setupTestDatabases();
```

#### `teardownTestDatabases()`
Closes all database connections and stops the MongoDB memory server.

```typescript
await teardownTestDatabases();
```

#### `clearAllData()`
Clears all data from both MySQL and MongoDB databases.

```typescript
await clearAllData();
```

#### `clearMySQLTables()`
Clears all MySQL tables only.

```typescript
await clearMySQLTables();
```

#### `clearMongoDBCollections()`
Clears all MongoDB collections only.

```typescript
await clearMongoDBCollections();
```

### Test Data Creation Functions

#### `createTestUser(data?: Partial<User>)`
Creates a test user with optional custom data.

```typescript
const user = await createTestUser({
  email: 'test@example.com',
  role: 'admin'
});
```

#### `createTestAdmin(data?: Partial<User>)`
Creates a test admin user (shorthand for `createTestUser` with `role: 'admin'`).

```typescript
const admin = await createTestAdmin();
```

#### `createTestProfile(data?: Partial<Profile>)`
Creates a test profile with optional custom data.

```typescript
const profile = await createTestProfile({
  name: 'John Doe',
  title: 'Developer'
});
```

#### `createTestProject(data?: Partial<Project>)`
Creates a test project with optional custom data.

```typescript
const project = await createTestProject({
  title: 'My Project',
  technologies: ['React', 'Node.js']
});
```

#### `createTestBlogPost(data?: Partial<BlogPost>)`
Creates a test blog post with optional custom data.

```typescript
const post = await createTestBlogPost({
  title: 'Test Post',
  slug: 'test-post'
});
```

#### `createTestContactMessage(data?: Partial<ContactMessage>)`
Creates a test contact message with optional custom data.

```typescript
const message = await createTestContactMessage({
  name: 'John Doe',
  email: 'john@example.com'
});
```

#### `createTestNewsletter(data?: Partial<Newsletter>)`
Creates a test newsletter subscription with optional custom data.

```typescript
const newsletter = await createTestNewsletter({
  email: 'subscriber@example.com'
});
```

#### `createTestRefreshToken(userId: string, data?: Partial<RefreshToken>)`
Creates a test refresh token for a user.

```typescript
const token = await createTestRefreshToken(user.id, {
  token: 'custom-token'
});
```

### Utility Functions

#### `wait(ms: number)`
Waits for a specified amount of time (useful for async operations).

```typescript
await wait(1000); // Wait 1 second
```

#### `getTestDatabaseStatus()`
Returns the current connection status of both databases.

```typescript
const status = getTestDatabaseStatus();
console.log(status); // { mysql: true, mongodb: true }
```

## Usage in Tests

### Basic Test Structure

```typescript
import { createTestUser, createTestProject } from '../__tests__/setup';

describe('My Feature', () => {
  it('should do something', async () => {
    // Create test data
    const user = await createTestUser();
    const project = await createTestProject();
    
    // Run your test
    expect(project.id).toBeDefined();
  });
});
```

### Using Custom Data

```typescript
it('should create a featured project', async () => {
  const project = await createTestProject({
    title: 'Featured Project',
    featured: true,
    technologies: ['React', 'TypeScript']
  });
  
  expect(project.featured).toBe(true);
  expect(project.technologies).toContain('React');
});
```

## Global Test Setup

The global test setup is configured in `src/test/setup.ts` and runs:
- `beforeAll`: Connects to both databases
- `afterAll`: Disconnects from both databases
- `beforeEach`: Clears all data from both databases

This ensures each test starts with a clean slate.

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- database-config.test.ts

# Run tests with coverage
npm test:coverage

# Run tests in watch mode
npm test:watch
```

## Best Practices

1. **Use test utilities**: Always use the provided test data creation functions instead of manually creating entities.

2. **Clean data**: The global setup automatically clears data before each test, but you can manually clear data if needed.

3. **Async/await**: Always use async/await when working with database operations.

4. **Isolation**: Each test should be independent and not rely on data from other tests.

5. **Descriptive names**: Use descriptive test names that explain what is being tested.

## Configuration

Test configuration is managed in:
- `jest.config.js`: Jest configuration with TypeORM decorator support
- `src/test/setup.ts`: Global test setup and teardown
- `src/__tests__/setup.ts`: Test utility functions
