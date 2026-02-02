import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;
  public isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    details?: any,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || this.getDefaultCode(statusCode);
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  private getDefaultCode(statusCode: number): string {
    const codes: { [key: number]: string } = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };
    return codes[statusCode] || 'UNKNOWN_ERROR';
  }
}

/**
 * Error response interface
 * Validates: Requirement 1.5 - User-friendly error messages
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
    stack?: string;
  };
}

/**
 * Format error response
 */
const formatErrorResponse = (
  err: ApiError | Error,
  req: Request
): ErrorResponse => {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;

  return {
    success: false,
    error: {
      code: isApiError ? err.code : 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      details:
        config.NODE_ENV === 'development' && isApiError
          ? err.details
          : undefined,
      timestamp: new Date().toISOString(),
      requestId: (req as any).id,
      stack: config.NODE_ENV === 'development' ? err.stack : undefined,
    },
  };
};

/**
 * Global error handling middleware
 * Validates: Requirement 1.5 - Graceful error handling
 */
export const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;

  // Log operational errors as warnings, programming errors as errors
  if (isApiError && err.isOperational) {
    console.warn(`⚠️  Operational Error [${err.code}]:`, err.message);
  } else {
    console.error('❌ Programming Error:', err);
  }

  // Don't expose internal errors in production
  if (!isApiError && config.NODE_ENV === 'production') {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
        timestamp: new Date().toISOString(),
        requestId: (req as any).id,
      },
    });
  }

  // Send formatted error response
  const errorResponse = formatErrorResponse(err, req);
  return res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new ApiError(
    404,
    `Route ${req.method} ${req.url} not found`,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors automatically
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error handler
 * Handles validation errors from request validation middleware
 */
export const validationErrorHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // This will be used with validation libraries like express-validator or joi
  // For now, it's a placeholder for future implementation
  next();
};

/**
 * Database error handler
 * Converts database errors to API errors
 */
export const databaseErrorHandler = (err: any): ApiError => {
  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];
    return new ApiError(
      409,
      `A record with this ${field} already exists`,
      'DUPLICATE_ENTRY',
      { field }
    );
  }

  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => ({
      field: e.path,
      message: e.message,
    }));
    return new ApiError(
      422,
      'Validation failed',
      'VALIDATION_ERROR',
      errors
    );
  }

  // MongoDB cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return new ApiError(
      400,
      `Invalid ${err.path}: ${err.value}`,
      'INVALID_ID'
    );
  }

  // Generic database error
  return new ApiError(
    500,
    'Database operation failed',
    'DATABASE_ERROR',
    config.NODE_ENV === 'development' ? err.message : undefined
  );
};

/**
 * Unhandled rejection handler
 * Catches unhandled promise rejections
 */
export const unhandledRejectionHandler = (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // In production, you might want to log this to an error tracking service
  // and potentially restart the server
};

/**
 * Uncaught exception handler
 * Catches uncaught exceptions
 */
export const uncaughtExceptionHandler = (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  // In production, log to error tracking service and gracefully shutdown
  process.exit(1);
};
