/**
 * Middleware exports
 * Central export point for all middleware functions
 */

export {
  corsMiddleware,
  corsErrorHandler,
} from './cors.middleware';

export {
  requestLogger,
  requestIdMiddleware,
  responseTimeMiddleware,
  detailedRequestLogger,
} from './logger.middleware';

export {
  ApiError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validationErrorHandler,
  databaseErrorHandler,
  unhandledRejectionHandler,
  uncaughtExceptionHandler,
} from './error.middleware';

export {
  authenticate,
  authorize,
  optionalAuth,
  requireAdmin,
  requireUser,
  AuthRequest,
} from './auth.middleware';

export {
  uploadSingle,
  uploadMultiple,
  uploadProfileImage,
  uploadProjectImage,
  uploadProjectImages,
  uploadBlogImage,
  UploadRequest,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
} from './upload.middleware';

export {
  trackPageView,
  trackProjectView,
} from './analytics.middleware';

// Rate limiting middleware
export {
  generalRateLimiter,
  authRateLimiter,
  contactRateLimiter,
  newsletterRateLimiter,
  uploadRateLimiter,
} from './rateLimit.middleware';

// Validation middleware
export {
  validate,
  sanitizeBody,
  sanitizeQuery,
  sanitizeString,
  sanitizeHtml,
  sanitizeObject,
  isValidObjectId,
  isValidUUID,
  validateObjectId,
  validateUUID,
  contactValidationRules,
  loginValidationRules,
  newsletterValidationRules,
  projectValidationRules,
  blogPostValidationRules,
  passwordResetValidationRules,
} from './validation.middleware';

// Security middleware
export {
  securityHeaders,
  httpsRedirect,
  additionalSecurityHeaders,
  requestSizeLimiter,
  ipWhitelist,
  suspiciousRequestDetector,
} from './security.middleware';
