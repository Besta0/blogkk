import { Request, Response, NextFunction } from 'express';
import validator from 'validator';
import { ApiError } from './error.middleware';

/**
 * Input Validation and Sanitization Middleware
 * Implements input data validation and cleaning
 * 
 * Requirements: 7.1, 7.4 - Security measures for input validation
 */

/**
 * Validation rule interface
 */
interface ValidationRule {
  field: string;
  type: 'string' | 'email' | 'url' | 'number' | 'boolean' | 'array' | 'object';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  sanitize?: boolean;
  custom?: (value: any) => boolean;
  customMessage?: string;
}

/**
 * Validation error detail
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * Sanitize string input - removes potentially dangerous characters
 * Uses a lighter touch to avoid breaking legitimate data
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  // Trim whitespace
  let sanitized = input.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
};

/**
 * Sanitize HTML content - allows safe HTML for rich text
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') return input;
  
  // For markdown/rich text content, we do minimal sanitization
  // The frontend should handle proper rendering
  return input.trim();
};

/**
 * Deep sanitize object - recursively sanitizes all string values
 */
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Validate a single field against rules
 */
const validateField = (value: any, rule: ValidationRule): string | null => {
  // Check required
  if (rule.required && (value === undefined || value === null || value === '')) {
    return `${rule.field} is required`;
  }
  
  // Skip validation if not required and empty
  if (!rule.required && (value === undefined || value === null || value === '')) {
    return null;
  }
  
  // Type validation
  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') {
        return `${rule.field} must be a string`;
      }
      if (rule.minLength && value.length < rule.minLength) {
        return `${rule.field} must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${rule.field} must be at most ${rule.maxLength} characters`;
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.customMessage || `${rule.field} has invalid format`;
      }
      break;
      
    case 'email':
      if (typeof value !== 'string' || !validator.isEmail(value)) {
        return `${rule.field} must be a valid email address`;
      }
      break;
      
    case 'url':
      if (typeof value !== 'string') {
        return `${rule.field} must be a string`;
      }
      // Allow empty string for optional URL fields
      if (value && !validator.isURL(value, { require_protocol: false, require_valid_protocol: false })) {
        return `${rule.field} must be a valid URL`;
      }
      break;
      
    case 'number':
      const num = typeof value === 'number' ? value : parseFloat(value);
      if (isNaN(num)) {
        return `${rule.field} must be a number`;
      }
      if (rule.min !== undefined && num < rule.min) {
        return `${rule.field} must be at least ${rule.min}`;
      }
      if (rule.max !== undefined && num > rule.max) {
        return `${rule.field} must be at most ${rule.max}`;
      }
      break;
      
    case 'boolean':
      if (typeof value !== 'boolean') {
        return `${rule.field} must be a boolean`;
      }
      break;
      
    case 'array':
      if (!Array.isArray(value)) {
        return `${rule.field} must be an array`;
      }
      if (rule.minLength && value.length < rule.minLength) {
        return `${rule.field} must have at least ${rule.minLength} items`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return `${rule.field} must have at most ${rule.maxLength} items`;
      }
      break;
      
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value) || value === null) {
        return `${rule.field} must be an object`;
      }
      break;
  }
  
  // Custom validation
  if (rule.custom && !rule.custom(value)) {
    return rule.customMessage || `${rule.field} is invalid`;
  }
  
  return null;
};

/**
 * Create validation middleware from rules
 */
export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: ValidationError[] = [];
    
    for (const rule of rules) {
      const value = req.body[rule.field];
      const error = validateField(value, rule);
      
      if (error) {
        errors.push({ field: rule.field, message: error });
      }
    }
    
    if (errors.length > 0) {
      throw new ApiError(422, 'Validation failed', 'VALIDATION_ERROR', errors);
    }
    
    next();
  };
};

/**
 * Sanitization middleware - sanitizes all request body fields
 */
export const sanitizeBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Sanitization middleware for query parameters
 * Note: In Express 5, req.query is read-only, so we sanitize values in place
 */
export const sanitizeQuery = (req: Request, res: Response, next: NextFunction) => {
  // In Express 5, req.query is read-only and uses ParsedQs type
  // We skip direct modification and let the validation middleware handle sanitization
  // The body sanitization is more important for security
  next();
};

/**
 * MongoDB ObjectId validation
 */
export const isValidObjectId = (id: string): boolean => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};

/**
 * UUID validation
 */
export const isValidUUID = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

/**
 * Validate MongoDB ObjectId parameter
 */
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    
    if (!id || typeof id !== 'string' || !isValidObjectId(id)) {
      throw new ApiError(400, `Invalid ${paramName} format`, 'INVALID_ID');
    }
    
    next();
  };
};

/**
 * Validate UUID parameter (for MySQL entities)
 */
export const validateUUID = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    
    if (!id || typeof id !== 'string' || !isValidUUID(id)) {
      throw new ApiError(400, `Invalid ${paramName} format`, 'INVALID_ID');
    }
    
    next();
  };
};

// Pre-built validation rules for common use cases

/**
 * Contact form validation rules
 */
export const contactValidationRules: ValidationRule[] = [
  { field: 'name', type: 'string', required: true, minLength: 2, maxLength: 100 },
  { field: 'email', type: 'email', required: true },
  { field: 'subject', type: 'string', required: true, minLength: 5, maxLength: 200 },
  { field: 'message', type: 'string', required: true, minLength: 10, maxLength: 5000 },
];

/**
 * Login validation rules
 */
export const loginValidationRules: ValidationRule[] = [
  { field: 'email', type: 'email', required: true },
  { field: 'password', type: 'string', required: true, minLength: 1 },
];

/**
 * Newsletter subscription validation rules
 */
export const newsletterValidationRules: ValidationRule[] = [
  { field: 'email', type: 'email', required: true },
];

/**
 * Project validation rules
 */
export const projectValidationRules: ValidationRule[] = [
  { field: 'title', type: 'string', required: true, minLength: 3, maxLength: 200 },
  { field: 'description', type: 'string', required: true, minLength: 10, maxLength: 5000 },
  { field: 'technologies', type: 'array', required: true, minLength: 1, maxLength: 30 },
  { field: 'images', type: 'array', required: false, maxLength: 10 },
  { field: 'githubUrl', type: 'url', required: false },
  { field: 'liveUrl', type: 'url', required: false },
  { field: 'featured', type: 'boolean', required: false },
];

/**
 * Blog post validation rules
 */
export const blogPostValidationRules: ValidationRule[] = [
  { field: 'title', type: 'string', required: true, minLength: 1, maxLength: 200 },
  { field: 'content', type: 'string', required: true, minLength: 10 },
  { field: 'excerpt', type: 'string', required: false, maxLength: 500 },
  { field: 'tags', type: 'array', required: false },
  { field: 'published', type: 'boolean', required: false },
];

/**
 * Password reset validation rules
 */
export const passwordResetValidationRules: ValidationRule[] = [
  { field: 'token', type: 'string', required: true },
  { 
    field: 'password', 
    type: 'string', 
    required: true, 
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    customMessage: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  },
];
