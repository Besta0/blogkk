/**
 * Upload Routes
 * Handles file upload and deletion endpoints
 */

import { Router } from 'express';
import { requireAdmin, uploadSingle, uploadMultiple, uploadRateLimiter } from '../middleware';
import { UploadController } from '../controllers/upload.controller';

const router = Router();

/**
 * @route   GET /api/upload/status
 * @desc    Get upload service status and configuration
 * @access  Public
 */
router.get('/status', UploadController.getStatus);

/**
 * @route   POST /api/upload/image
 * @desc    Upload a single image
 * @access  Private (Admin only)
 * @rateLimit 20 uploads per hour
 * @body    image - Image file (multipart/form-data)
 * @returns { url, publicId, width, height, format, bytes }
 */
router.post(
  '/image',
  requireAdmin,
  uploadRateLimiter,
  ...uploadSingle('image', 'general'),
  UploadController.uploadImage
);

/**
 * @route   POST /api/upload/profile
 * @desc    Upload a profile image (optimized for avatars)
 * @access  Private (Admin only)
 * @rateLimit 20 uploads per hour
 * @body    image - Image file (multipart/form-data)
 * @returns { url, publicId, width, height, format, bytes }
 */
router.post(
  '/profile',
  requireAdmin,
  uploadRateLimiter,
  ...uploadSingle('image', 'profile'),
  UploadController.uploadImage
);

/**
 * @route   POST /api/upload/project
 * @desc    Upload a project image (optimized for project display)
 * @access  Private (Admin only)
 * @rateLimit 20 uploads per hour
 * @body    image - Image file (multipart/form-data)
 * @returns { url, publicId, width, height, format, bytes }
 */
router.post(
  '/project',
  requireAdmin,
  uploadRateLimiter,
  ...uploadSingle('image', 'project'),
  UploadController.uploadImage
);

/**
 * @route   POST /api/upload/blog
 * @desc    Upload a blog featured image
 * @access  Private (Admin only)
 * @rateLimit 20 uploads per hour
 * @body    image - Image file (multipart/form-data)
 * @returns { url, publicId, width, height, format, bytes }
 */
router.post(
  '/blog',
  requireAdmin,
  uploadRateLimiter,
  ...uploadSingle('image', 'blog'),
  UploadController.uploadImage
);

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images (up to 5)
 * @access  Private (Admin only)
 * @rateLimit 20 uploads per hour
 * @body    images - Image files (multipart/form-data)
 * @returns { images: [{ url, publicId, width, height, format, bytes }], count }
 */
router.post(
  '/images',
  requireAdmin,
  uploadRateLimiter,
  ...uploadMultiple('images', 5, 'general'),
  UploadController.uploadImages
);

/**
 * @route   DELETE /api/upload/image/:publicId
 * @desc    Delete an image by public ID
 * @access  Private (Admin only)
 * @param   publicId - Cloudinary public ID (URL encoded if contains slashes)
 */
router.delete('/image/:publicId', requireAdmin, UploadController.deleteImage);

export default router;
