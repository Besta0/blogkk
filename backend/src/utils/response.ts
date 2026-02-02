import { Response } from 'express';
import { ApiResponse } from '../types';

export class ResponseUtil {
  static success<T>(res: Response, data: T, statusCode = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(
    res: Response,
    code: string,
    message: string,
    statusCode = 500,
    details?: unknown
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
    };
    return res.status(statusCode).json(response);
  }

  static badRequest(
    res: Response,
    message: string,
    details?: unknown
  ): Response {
    return this.error(res, 'BAD_REQUEST', message, 400, details);
  }

  static unauthorized(res: Response, message = 'Unauthorized'): Response {
    return this.error(res, 'UNAUTHORIZED', message, 401);
  }

  static forbidden(res: Response, message = 'Forbidden'): Response {
    return this.error(res, 'FORBIDDEN', message, 403);
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return this.error(res, 'NOT_FOUND', message, 404);
  }

  static conflict(res: Response, message: string, details?: unknown): Response {
    return this.error(res, 'CONFLICT', message, 409, details);
  }

  static validationError(
    res: Response,
    message: string,
    details?: unknown
  ): Response {
    return this.error(res, 'VALIDATION_ERROR', message, 422, details);
  }

  static internalError(
    res: Response,
    message = 'Internal server error'
  ): Response {
    return this.error(res, 'INTERNAL_SERVER_ERROR', message, 500);
  }
}
