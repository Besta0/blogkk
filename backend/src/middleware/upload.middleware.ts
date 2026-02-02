/**
 * File Upload Middleware
 * Handles file uploads using Multer and Cloudinary
 */

import { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';
import multer, { FileFilterCallback, MulterError } from 'multer';
import { 
  uploadToCloudinary, 
  isCloudinaryConfigured, 
  UploadType,
  CloudinaryUploadResult 
} from '../config/cloudinary';
import { ApiError } from './error.middleware';

/**
 * Extended Request interface with uploaded file info
 */
export interface UploadRequest extends Request {
  uploadedFile?: CloudinaryUploadResult;
  uploadedFiles?: CloudinaryUploadResult[];
}

/**
 * Allowed MIME types for image uploads
 */
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Maximum file size (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * File filter function to validate uploaded files
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new ApiError(
        400,
        `Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        'INVALID_FILE_TYPE'
      )
    );
  }
};

/**
 * Multer configuration with memory storage
 * Files are stored in memory as Buffer for Cloudinary upload
 */
const multerStorage = multer.memoryStorage();

/**
 * Base multer instance
 */
const upload = multer({
  storage: multerStorage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10, // Maximum 10 files per request
  },
});

/**
 * Handle multer errors - this is an error handler middleware (4 params)
 */
const handleMulterError: ErrorRequestHandler = (error, _req, res, next): void => {
  if (error instanceof MulterError) {
    let message = 'File upload error';
    let code = 'UPLOAD_ERROR';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
        code = 'FILE_TOO_LARGE';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum is 10 files per request';
        code = 'TOO_MANY_FILES';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name for file upload';
        code = 'UNEXPECTED_FIELD';
        break;
      default:
        message = error.message;
    }

    res.status(400).json({
      success: false,
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  next(error);
};

/**
 * Wrapper to handle multer upload with error catching
 */
const wrapMulterUpload = (
  multerMiddleware: RequestHandler
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    multerMiddleware(req, res, (err: unknown) => {
      if (err) {
        handleMulterError(err as Error, req, res, next);
        return;
      }
      next();
    });
  };
};

/**
 * Check Cloudinary configuration middleware
 */
const checkCloudinaryConfig: RequestHandler = (_req, res, next): void => {
  if (!isCloudinaryConfigured()) {
    res.status(503).json({
      success: false,
      error: {
        code: 'CLOUDINARY_NOT_CONFIGURED',
        message: 'File upload service is not configured',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }
  next();
};

/**
 * Create middleware for single file upload with Cloudinary
 */
export const uploadSingle = (
  fieldName: string,
  uploadType: UploadType = 'general'
): RequestHandler[] => {
  return [
    checkCloudinaryConfig,
    wrapMulterUpload(upload.single(fieldName)),
    async (req: UploadRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.file) {
          next();
          return;
        }

        const result = await uploadToCloudinary(req.file.buffer, uploadType);
        req.uploadedFile = result;
        next();
      } catch (error) {
        next(error);
      }
    },
  ];
};

/**
 * Create middleware for multiple file upload with Cloudinary
 */
export const uploadMultiple = (
  fieldName: string,
  maxCount: number = 5,
  uploadType: UploadType = 'general'
): RequestHandler[] => {
  return [
    checkCloudinaryConfig,
    wrapMulterUpload(upload.array(fieldName, maxCount)),
    async (req: UploadRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const files = req.files as Express.Multer.File[] | undefined;
        
        if (!files || files.length === 0) {
          next();
          return;
        }

        const uploadPromises = files.map((file) =>
          uploadToCloudinary(file.buffer, uploadType)
        );

        req.uploadedFiles = await Promise.all(uploadPromises);
        next();
      } catch (error) {
        next(error);
      }
    },
  ];
};

/**
 * Middleware for profile image upload
 */
export const uploadProfileImage = uploadSingle('avatar', 'profile');

/**
 * Middleware for project image upload (single)
 */
export const uploadProjectImage = uploadSingle('image', 'project');

/**
 * Middleware for project images upload (multiple)
 */
export const uploadProjectImages = uploadMultiple('images', 5, 'project');

/**
 * Middleware for blog image upload
 */
export const uploadBlogImage = uploadSingle('featuredImage', 'blog');

export { upload, MAX_FILE_SIZE, ALLOWED_MIME_TYPES };
