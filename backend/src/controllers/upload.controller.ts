/**
 * Upload Controller
 * Handles file upload and deletion operations
 */

import { Response, NextFunction } from 'express';
import { UploadRequest } from '../middleware/upload.middleware';
import { deleteFromCloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { ApiError, asyncHandler } from '../middleware/error.middleware';

/**
 * Upload Controller class
 * Provides endpoints for file upload and management
 */
export class UploadController {
  /**
   * Upload a single image
   * @route POST /api/upload/image
   * @access Private (Admin only)
   */
  static uploadImage = asyncHandler(
    async (req: UploadRequest, res: Response, _next: NextFunction): Promise<void> => {
      if (!req.uploadedFile) {
        throw new ApiError(400, 'No file uploaded', 'NO_FILE_UPLOADED');
      }

      res.status(201).json({
        success: true,
        data: {
          url: req.uploadedFile.secureUrl,
          publicId: req.uploadedFile.publicId,
          width: req.uploadedFile.width,
          height: req.uploadedFile.height,
          format: req.uploadedFile.format,
          bytes: req.uploadedFile.bytes,
        },
      });
    }
  );

  /**
   * Upload multiple images
   * @route POST /api/upload/images
   * @access Private (Admin only)
   */
  static uploadImages = asyncHandler(
    async (req: UploadRequest, res: Response, _next: NextFunction): Promise<void> => {
      if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
        throw new ApiError(400, 'No files uploaded', 'NO_FILES_UPLOADED');
      }

      const uploadedImages = req.uploadedFiles.map((file) => ({
        url: file.secureUrl,
        publicId: file.publicId,
        width: file.width,
        height: file.height,
        format: file.format,
        bytes: file.bytes,
      }));

      res.status(201).json({
        success: true,
        data: {
          images: uploadedImages,
          count: uploadedImages.length,
        },
      });
    }
  );

  /**
   * Delete an image by public ID
   * @route DELETE /api/upload/image/:publicId
   * @access Private (Admin only)
   */
  static deleteImage = asyncHandler(
    async (req: UploadRequest, res: Response, _next: NextFunction): Promise<void> => {
      const publicIdParam = req.params.publicId;

      // Handle both string and string[] cases (from wildcard route)
      const publicId = Array.isArray(publicIdParam) ? publicIdParam.join('/') : publicIdParam;

      if (!publicId) {
        throw new ApiError(400, 'Public ID is required', 'MISSING_PUBLIC_ID');
      }

      if (!isCloudinaryConfigured()) {
        throw new ApiError(503, 'File storage service is not configured', 'CLOUDINARY_NOT_CONFIGURED');
      }

      // Decode the public ID (it may contain slashes encoded as %2F)
      const decodedPublicId = decodeURIComponent(publicId);

      const deleted = await deleteFromCloudinary(decodedPublicId);

      if (!deleted) {
        throw new ApiError(404, 'Image not found or could not be deleted', 'DELETE_FAILED');
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'Image deleted successfully',
          publicId: decodedPublicId,
        },
      });
    }
  );

  /**
   * Get upload service status
   * @route GET /api/upload/status
   * @access Public
   */
  static getStatus = asyncHandler(
    async (_req: UploadRequest, res: Response, _next: NextFunction): Promise<void> => {
      const configured = isCloudinaryConfigured();

      res.status(200).json({
        success: true,
        data: {
          configured,
          maxFileSize: 5 * 1024 * 1024, // 5MB
          allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
          maxFiles: 10,
        },
      });
    }
  );
}
