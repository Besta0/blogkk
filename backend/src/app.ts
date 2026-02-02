import '@dotenvx/dotenvx/config';
import express from 'express';
import { getDatabaseStatus } from './config/database';
import {
  corsMiddleware,
  corsErrorHandler,
  requestLogger,
  requestIdMiddleware,
  responseTimeMiddleware,
  errorHandler,
  notFoundHandler,
  generalRateLimiter,
  sanitizeBody,
  sanitizeQuery,
  securityHeaders,
  httpsRedirect,
  additionalSecurityHeaders,
  suspiciousRequestDetector,
} from './middleware';

const app = express();

// Trust proxy - important for getting correct client IP behind reverse proxies
app.set('trust proxy', 1);

// HTTPS redirect (production only)
app.use(httpsRedirect);

// Security headers (enhanced helmet configuration)
app.use(securityHeaders);
app.use(additionalSecurityHeaders);

// Suspicious request detection
app.use(suspiciousRequestDetector);

// Request tracking middleware (must be early in the chain)
app.use(requestIdMiddleware);
app.use(responseTimeMiddleware);

// CORS configuration with error handling
app.use(corsMiddleware);
app.use(corsErrorHandler);

// General rate limiting for all API routes
app.use('/api', generalRateLimiter);

// Logging middleware
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization middleware
app.use(sanitizeBody);
app.use(sanitizeQuery);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  
  res.status(dbStatus ? 200 : 503).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus,
      status: dbStatus ? 'healthy' : 'disconnected',
    },
  });
});

// API health check endpoint (for Docker/Kubernetes)
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  
  res.status(dbStatus ? 200 : 503).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbStatus,
      status: dbStatus ? 'healthy' : 'disconnected',
    },
  });
});

// API routes
import routes from './routes';
app.use('/api', routes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;