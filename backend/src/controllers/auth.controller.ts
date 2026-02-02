import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services';
import { ApiResponse } from '../types';

export class AuthController {
  /**
   * Login endpoint
   * POST /api/auth/login
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse);
        return;
      }

      // Attempt login
      const result = await AuthService.login(email, password);

      if (!result) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse);
        return;
      }

      const { user, accessToken, refreshToken } = result;

      // Return success response
      res.status(200).json({
        success: true,
        data: {
          token: accessToken,
          refreshToken: refreshToken,
          user: {
            id: user._id,
            email: user.email,
            role: user.role,
          },
        },
      } as ApiResponse);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid email or password') {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse);
        return;
      }
      next(error);
    }
  }

  /**
   * Refresh token endpoint
   * POST /api/auth/refresh
   */
  static async refresh(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      // Validate input
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse);
        return;
      }

      // Refresh tokens
      const result = await AuthService.refreshAccessToken(refreshToken);

      if (!result) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired refresh token',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse);
        return;
      }

      // Return success response
      res.status(200).json({
        success: true,
        data: {
          token: result.accessToken,
          refreshToken: result.refreshToken,
        },
      } as ApiResponse);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes('Invalid') || error.message.includes('expired'))
      ) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse);
        return;
      }
      next(error);
    }
  }

  /**
   * Logout endpoint
   * POST /api/auth/logout
   */
  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      // Validate input
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Refresh token is required',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse);
        return;
      }

      // Logout user
      await AuthService.logout(refreshToken);

      // Return success response
      res.status(200).json({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset endpoint
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;

      // Validate input
      if (!email) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse);
        return;
      }

      // Request password reset
      await AuthService.requestPasswordReset(email);

      // Always return success to prevent email enumeration
      res.status(200).json({
        success: true,
        data: {
          message: 'If the email exists, a password reset link has been sent',
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password endpoint
   * POST /api/auth/reset-password
   */
  static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token, password } = req.body;

      // Validate input
      if (!token || !password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Token and password are required',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse);
        return;
      }

      // Validate password length
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Password must be at least 6 characters',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse);
        return;
      }

      // Reset password
      await AuthService.resetPassword(token, password);

      // Return success response
      res.status(200).json({
        success: true,
        data: {
          message: 'Password reset successfully',
        },
      } as ApiResponse);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'Invalid or expired reset token'
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid or expired reset token',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse);
        return;
      }
      next(error);
    }
  }

  /**
   * Verify reset token endpoint
   * GET /api/auth/verify-reset-token/:token
   */
  static async verifyResetToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.params;

      // Validate input
      if (!token || typeof token !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Token is required',
            timestamp: new Date().toISOString(),
          },
        } as ApiResponse);
        return;
      }

      // Verify token
      const isValid = await AuthService.verifyResetToken(token);

      // Return response
      res.status(200).json({
        success: true,
        data: {
          valid: isValid,
        },
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}
