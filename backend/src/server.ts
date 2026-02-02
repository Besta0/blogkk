import app from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { config } from './config';
import {
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
} from './middleware';

const PORT = config.PORT;

// Handle uncaught exceptions
process.on('uncaughtException', uncaughtExceptionHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', unhandledRejectionHandler);

/**
 * Start the server with database connection
 */
async function startServer() {
  try {
    // Connect to database first
    await connectDatabase();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${config.NODE_ENV}`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully`);
      
      // Close server first
      server.close(async () => {
        console.log('✅ HTTP server closed');
        
        // Then disconnect from database
        try {
          await disconnectDatabase();
          console.log('✅ Database connection closed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during database disconnection:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
const serverPromise = startServer();

export default serverPromise;