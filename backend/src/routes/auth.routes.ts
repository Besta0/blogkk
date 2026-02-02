import { Router } from 'express';
import { AuthController } from '../controllers';
import { 
  authRateLimiter, 
  validate, 
  loginValidationRules,
  passwordResetValidationRules 
} from '../middleware';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT tokens
 * @access  Public
 * @rateLimit 5 requests per 15 minutes
 */
router.post('/login', authRateLimiter, validate(loginValidationRules), AuthController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @rateLimit 5 requests per 15 minutes
 */
router.post('/refresh', authRateLimiter, AuthController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and revoke refresh token
 * @access  Public
 */
router.post('/logout', AuthController.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset email
 * @access  Public
 * @rateLimit 5 requests per 15 minutes
 */
router.post('/forgot-password', authRateLimiter, AuthController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 * @rateLimit 5 requests per 15 minutes
 */
router.post('/reset-password', authRateLimiter, validate(passwordResetValidationRules), AuthController.resetPassword);

/**
 * @route   GET /api/auth/verify-reset-token/:token
 * @desc    Verify if reset token is valid
 * @access  Public
 */
router.get('/verify-reset-token/:token', AuthController.verifyResetToken);

export default router;
