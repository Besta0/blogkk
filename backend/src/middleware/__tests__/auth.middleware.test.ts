import { Request, Response, NextFunction } from 'express';
import {
  authenticate,
  authorize,
  optionalAuth,
  requireAdmin,
  requireUser,
  AuthRequest,
} from '../auth.middleware';
import { AuthService } from '../../services/auth.service';
import { ApiError } from '../error.middleware';

// Mock AuthService
jest.mock('../../services/auth.service');

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should authenticate valid token and attach user to request', () => {
      const mockPayload = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (AuthService.verifyAccessToken as jest.Mock).mockReturnValue(mockPayload);

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(AuthService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject request without authorization header', () => {
      mockRequest.headers = {};

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTH_REQUIRED');
    });

    it('should reject request with invalid authorization format', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTH_REQUIRED');
    });

    it('should reject request with empty token', () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTH_REQUIRED');
    });

    it('should reject expired or invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      (AuthService.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      authenticate(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('TOKEN_INVALID');
    });
  });

  describe('authorize', () => {
    it('should allow user with correct role', () => {
      mockRequest.user = {
        id: 'user123',
        email: 'admin@example.com',
        role: 'admin',
      };

      const middleware = authorize('admin');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow user with any of multiple allowed roles', () => {
      mockRequest.user = {
        id: 'user123',
        email: 'user@example.com',
        role: 'user',
      };

      const middleware = authorize('user', 'admin');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject user without authentication', () => {
      mockRequest.user = undefined;

      const middleware = authorize('admin');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTH_REQUIRED');
    });

    it('should reject user with insufficient permissions (403)', () => {
      mockRequest.user = {
        id: 'user123',
        email: 'user@example.com',
        role: 'user',
      };

      const middleware = authorize('admin');
      middleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('FORBIDDEN');
    });
  });

  describe('optionalAuth', () => {
    it('should attach user if valid token is provided', () => {
      const mockPayload = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user',
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      (AuthService.verifyAccessToken as jest.Mock).mockReturnValue(mockPayload);

      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user if no token is provided', () => {
      mockRequest.headers = {};

      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should continue without user if token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      (AuthService.verifyAccessToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      optionalAuth(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireAdmin', () => {
    it('should be an array of middleware functions', () => {
      expect(Array.isArray(requireAdmin)).toBe(true);
      expect(requireAdmin).toHaveLength(2);
    });
  });

  describe('requireUser', () => {
    it('should be an array of middleware functions', () => {
      expect(Array.isArray(requireUser)).toBe(true);
      expect(requireUser).toHaveLength(2);
    });
  });
});
