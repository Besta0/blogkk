import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from '../config';

/**
 * CORS configuration middleware
 * Validates: Requirement 1.4 - Correct CORS policy configuration
 */

// Allowed origins based on environment
const getAllowedOrigins = (): string[] => {
  const origins = [
    config.FRONTEND_URL || 'http://localhost:3030',
    'http://localhost:5173', // Development frontend
    'http://localhost:3030', // Vite dev server
    'http://localhost:3000', // Alternative dev port
  ];

  // Add production origins from environment variable
  if (process.env.ALLOWED_ORIGINS) {
    const additionalOrigins = process.env.ALLOWED_ORIGINS.split(',').map(
      (origin) => origin.trim()
    );
    origins.push(...additionalOrigins);
  }

  return origins;
};

// CORS options configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    }
  },
  credentials: true, // Allow cookies and authentication headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours - how long the browser should cache preflight requests
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

/**
 * CORS middleware with custom configuration
 */
export const corsMiddleware = cors(corsOptions);

/**
 * Custom CORS error handler
 */
export const corsErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CORS_ERROR',
        message: 'Cross-Origin Request Blocked',
        details: config.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString(),
      },
    });
  }
  return next(err);
};
