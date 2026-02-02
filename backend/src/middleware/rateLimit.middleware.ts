import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '../config';

/**
 * Rate Limiting Middleware
 * Implements API rate limiting to prevent abuse
 * 
 * Requirements: 7.1, 7.4 - Security measures for API protection
 */

/**
 * Check if we're in test environment
 */
const isTestEnv = config.NODE_ENV === 'test' || process.env.NODE_ENV === 'test';

/**
 * Standard error response for rate limit exceeded
 */
const rateLimitResponse = (req: Request, res: Response) => {
  res.status(429).json({
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later',
      timestamp: new Date().toISOString(),
      retryAfter: res.getHeader('Retry-After'),
    },
  });
};

/**
 * General API rate limiter
 * Applies to all API routes
 * 100 requests per 15 minutes per IP
 * Disabled in test environment to allow property-based testing
 */
export const generalRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.NODE_ENV === 'production' ? 100 : 1000, // More lenient in development
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: rateLimitResponse,
  skip: (req: Request) => {
    // Skip rate limiting for health checks and in test environment
    return req.path === '/health' || isTestEnv;
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login/password reset
 * 5 requests per 15 minutes per IP
 * Disabled in test environment to allow property-based testing
 */
export const authRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.NODE_ENV === 'production' ? 5 : 50, // Very strict in production
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
  skipSuccessfulRequests: false, // Count all requests
  skip: () => isTestEnv, // Skip in test environment
});

/**
 * Rate limiter for contact form submissions
 * Prevents spam submissions
 * 3 requests per hour per IP
 * Disabled in test environment to allow property-based testing
 */
export const contactRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.NODE_ENV === 'production' ? 3 : 50,
  message: 'Too many contact submissions, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
  skip: () => isTestEnv, // Skip in test environment
});

/**
 * Rate limiter for newsletter subscriptions
 * Prevents spam subscriptions
 * 5 requests per hour per IP
 * Disabled in test environment to allow property-based testing
 */
export const newsletterRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.NODE_ENV === 'production' ? 5 : 50,
  message: 'Too many subscription attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
  skip: () => isTestEnv, // Skip in test environment
});

/**
 * Rate limiter for file uploads
 * Prevents abuse of upload endpoints
 * 20 uploads per hour per IP
 * Disabled in test environment to allow property-based testing
 */
export const uploadRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.NODE_ENV === 'production' ? 20 : 100,
  message: 'Too many upload attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitResponse,
  skip: () => isTestEnv, // Skip in test environment
});
