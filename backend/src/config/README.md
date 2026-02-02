# Configuration Module

This directory contains configuration files for the backend application.

## Files

### `index.ts`
Main configuration file that loads and exports environment variables.

### `database.ts`
MongoDB database connection manager with the following features:

- **Singleton Pattern**: Ensures only one database connection instance
- **Connection Management**: Handles connect/disconnect operations
- **Error Handling**: Comprehensive error handling and logging
- **Event Listeners**: Monitors connection status changes
- **Graceful Shutdown**: Properly closes connections on application termination
- **Connection Pooling**: Configured with optimal pool settings
- **Environment Support**: Separate URIs for development, test, and production

## Database Connection Usage

### Basic Usage

```typescript
import { connectDatabase, disconnectDatabase, getDatabaseStatus } from './config/database';

// Connect to database
await connectDatabase();

// Check connection status
const isConnected = getDatabaseStatus();

// Disconnect from database
await disconnectDatabase();
```

### In Server Startup

```typescript
import { connectDatabase } from './config/database';

async function startServer() {
  await connectDatabase();
  // Start Express server
}
```

## MongoDB Setup

### Option 1: MongoDB Atlas (Recommended for Development)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use local connection string in `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/portfolio
   ```

## Testing Database Connection

Run the test script to verify your database connection:

```bash
npm run test:db
```

Or manually:

```bash
npx ts-node src/scripts/test-db-connection.ts
```

## Connection Options

The database connection is configured with the following Mongoose options:

- `maxPoolSize: 10` - Maximum number of connections in the pool
- `minPoolSize: 2` - Minimum number of connections to maintain
- `socketTimeoutMS: 45000` - Socket timeout (45 seconds)
- `serverSelectionTimeoutMS: 5000` - Server selection timeout (5 seconds)
- `family: 4` - Use IPv4 (skip IPv6 attempts)

## Environment Variables

Required environment variables for database configuration:

- `MONGODB_URI` - MongoDB connection string for development/production
- `MONGODB_TEST_URI` - MongoDB connection string for testing
- `NODE_ENV` - Environment mode (development, test, production)

## Error Handling

The database module handles the following error scenarios:

1. **Connection Failures**: Logs error and throws exception
2. **Connection Loss**: Automatically detected via event listeners
3. **Disconnection Errors**: Logged and handled gracefully
4. **Application Termination**: Ensures clean database disconnection

## Event Listeners

The module sets up the following Mongoose event listeners:

- `connected` - Fired when connection is established
- `error` - Fired when connection error occurs
- `disconnected` - Fired when connection is lost

## Graceful Shutdown

The module handles the following termination signals:

- `SIGINT` - Interrupt signal (Ctrl+C)
- `SIGTERM` - Termination signal (from process managers)

Both signals trigger:
1. Database disconnection
2. Clean process exit
