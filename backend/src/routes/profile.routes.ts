import { Router, Response } from 'express';
import { AuthRequest, requireAdmin, requireUser, optionalAuth } from '../middleware';
import { ProfileController } from '../controllers/profile.controller';

const router = Router();

/**
 * @route   GET /api/profile
 * @desc    Get public profile information
 * @access  Public
 */
router.get('/', ProfileController.getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update profile (full update, requires all fields)
 * @access  Private (Admin only)
 */
router.put('/', requireAdmin, ProfileController.updateProfile);

/**
 * @route   PATCH /api/profile
 * @desc    Partial update profile (update specific fields)
 * @access  Private (Admin only)
 */
router.patch('/', requireAdmin, ProfileController.patchProfile);

/**
 * @route   GET /api/profile/me
 * @desc    Get current user profile (authenticated user info)
 * @access  Private (User or Admin)
 */
router.get('/me', requireUser, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

/**
 * @route   GET /api/profile/admin
 * @desc    Admin-only endpoint example
 * @access  Private (Admin only)
 */
router.get('/admin', requireAdmin, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'Welcome to admin area',
      user: req.user,
    },
  });
});

/**
 * @route   GET /api/profile/public
 * @desc    Public endpoint with optional auth
 * @access  Public (but shows different data if authenticated)
 */
router.get('/public', optionalAuth, (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      message: req.user ? `Hello, ${req.user.email}` : 'Hello, guest',
      authenticated: !!req.user,
      user: req.user || null,
    },
  });
});

export default router;
