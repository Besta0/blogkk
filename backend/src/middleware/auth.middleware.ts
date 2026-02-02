  import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/auth.service';
import { ApiError } from './error.middleware';

/**
 * Extended Request interface with user information
 */
export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 * 
 * Requirements: 7.1 - User access to admin panel requires login verification
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required', 'AUTH_REQUIRED');
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new ApiError(401, 'Authentication token is missing', 'AUTH_REQUIRED');
    }

    // Verify token
    try {
      const payload = AuthService.verifyAccessToken(token);
      
      // Attach user info to request
      req.user = payload;
      
      next();
    } catch (error) {
      // Requirements: 7.3 - When session expires, return 401 status code
      throw new ApiError(401, 'Invalid or expired authentication token', 'TOKEN_INVALID');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware factory
 * Creates middleware to check if user has required role(s)
 * 
 * Requirements: 7.4 - When user has insufficient permissions, return 403 status code
 * 
 * @param roles - Array of allowed roles or single role
 * @returns Express middleware function
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'AUTH_REQUIRED');
      }

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        throw new ApiError(
          403,
          'You do not have permission to access this resource',
          'FORBIDDEN'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 * Useful for routes that have different behavior for authenticated users
 */
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        try {
          const payload = AuthService.verifyAccessToken(token);
          req.user = payload;
        } catch (error) {
          // Silently fail for optional auth
          // User will be undefined, but request continues
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Admin-only middleware
 * Shorthand for authenticate + authorize('admin')
 */
export const requireAdmin = [
  authenticate,
  authorize('admin')
];

/**
 * User or Admin middleware
 * Allows both regular users and admins
 */
export const requireUser = [
  authenticate,
  authorize('user', 'admin')
];
