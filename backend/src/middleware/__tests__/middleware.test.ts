/**
 * Middleware tests
 * Tests for CORS, logging, and error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError, errorHandler, notFoundHandler } from '../error.middleware';
import { corsErrorHandler } from '../cors.middleware';
import { requestIdMiddleware, responseTimeMiddleware } from '../logger.middleware';

// Mock Express objects
const mockRequest = (overrides = {}): Partial<Request> => ({
  method: 'GET',
  url: '/test',
  headers: {},
  body: {},
  query: {},
  params: {},
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return res;
};

const mockNext = (): NextFunction => jest.fn();

describe('Error Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console output during tests
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ApiError', () => {
    it('should create an ApiError with correct properties', () => {
      const error = new ApiError(404, 'Not found', 'NOT_FOUND');
      
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.code).toBe('NOT_FOUND');
      expect(error.isOperational).toBe(true);
    });

    it('should use default code if not provided', () => {
      const error = new ApiError(400, 'Bad request');
      
      expect(error.code).toBe('BAD_REQUEST');
    });

    it('should include details if provided', () => {
      const details = { field: 'email', reason: 'invalid format' };
      const error = new ApiError(422, 'Validation failed', 'VALIDATION_ERROR', details);
      
      expect(error.details).toEqual(details);
    });
  });

  describe('errorHandler', () => {
    it('should handle ApiError correctly', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();
      const error = new ApiError(404, 'Resource not found', 'NOT_FOUND');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOT_FOUND',
            message: 'Resource not found',
            timestamp: expect.any(String),
          }),
        })
      );
    });

    it('should handle generic Error', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();
      const error = new Error('Something went wrong');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Something went wrong',
          }),
        })
      );
    });

    it('should include request ID if available', () => {
      const req = mockRequest() as Request;
      (req as any).id = 'test-request-id';
      const res = mockResponse() as Response;
      const next = mockNext();
      const error = new ApiError(400, 'Bad request');

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            requestId: 'test-request-id',
          }),
        })
      );
    });
  });

  describe('notFoundHandler', () => {
    it('should create 404 error for undefined routes', () => {
      const req = mockRequest({ method: 'GET', url: '/api/unknown' }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      notFoundHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          code: 'ROUTE_NOT_FOUND',
          message: expect.stringContaining('/api/unknown'),
        })
      );
    });
  });
});

describe('CORS Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('corsErrorHandler', () => {
    it('should handle CORS errors', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();
      const error = new Error('Origin not allowed by CORS policy');

      corsErrorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'CORS_ERROR',
            message: 'Cross-Origin Request Blocked',
          }),
        })
      );
    });

    it('should pass non-CORS errors to next middleware', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();
      const error = new Error('Some other error');

      corsErrorHandler(error, req, res, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});

describe('Logger Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestIdMiddleware', () => {
    it('should add request ID to request object', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      requestIdMiddleware(req, res, next);

      expect((req as any).id).toBeDefined();
      expect(typeof (req as any).id).toBe('string');
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', (req as any).id);
      expect(next).toHaveBeenCalled();
    });

    it('should generate unique request IDs', () => {
      const req1 = mockRequest() as Request;
      const req2 = mockRequest() as Request;
      const res1 = mockResponse() as Response;
      const res2 = mockResponse() as Response;
      const next = mockNext();

      requestIdMiddleware(req1, res1, next);
      requestIdMiddleware(req2, res2, next);

      expect((req1 as any).id).not.toBe((req2 as any).id);
    });
  });

  describe('responseTimeMiddleware', () => {
    it('should add response time header', (done) => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      responseTimeMiddleware(req, res, next);

      // Simulate response end
      setTimeout(() => {
        res.end!();
        expect(res.setHeader).toHaveBeenCalledWith(
          'X-Response-Time',
          expect.any(Number)
        );
        done();
      }, 10);
    });
  });
});

console.log('✅ Middleware tests defined successfully');
