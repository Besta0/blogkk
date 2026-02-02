import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { config } from '../config';

/**
 * Security Middleware
 * Configures security headers and HTTPS enforcement
 * 
 * Requirements: 7.1, 7.4 - Security measures for API protection
 */

/**
 * Enhanced Helmet configuration for security headers
 */
export const securityHeaders = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for some frameworks
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'], // Allow images from various sources
      fontSrc: ["'self'", 'https:', 'data:'],
      connectSrc: ["'self'", 'https:'], // Allow API connections
      frameSrc: ["'none'"], // Disallow iframes
      objectSrc: ["'none'"], // Disallow plugins
      upgradeInsecureRequests: config.NODE_ENV === 'production' ? [] : null,
    },
  },
  
  // Cross-Origin settings
  crossOriginEmbedderPolicy: false, // Disable for compatibility with external resources
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resource sharing
  
  // DNS Prefetch Control
  dnsPrefetchControl: { allow: false },
  
  // Frameguard - prevent clickjacking
  frameguard: { action: 'deny' },
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
  
  // HSTS - HTTP Strict Transport Security (only in production)
  hsts: config.NODE_ENV === 'production' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  } : false,
  
  // IE No Open
  ieNoOpen: true,
  
  // No Sniff - prevent MIME type sniffing
  noSniff: true,
  
  // Origin Agent Cluster
  originAgentCluster: true,
  
  // Permitted Cross-Domain Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  
  // Referrer Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  
  // XSS Filter
  xssFilter: true,
});

/**
 * HTTPS redirect middleware (for production)
 * Redirects HTTP requests to HTTPS
 */
export const httpsRedirect = (req: Request, res: Response, next: NextFunction) => {
  // Skip in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  // Skip health check endpoints (for Docker/Kubernetes probes)
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }
  
  // Check if request is already HTTPS
  // x-forwarded-proto is set by reverse proxies like nginx, heroku, etc.
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  
  if (!isHttps) {
    // Redirect to HTTPS
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  
  next();
};

/**
 * Additional security headers not covered by helmet
 */
export const additionalSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent caching of sensitive data
  if (req.path.includes('/auth') || req.path.includes('/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  
  // Feature Policy / Permissions Policy
  res.setHeader('Permissions-Policy', 
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
  
  // Expect-CT header for Certificate Transparency
  if (config.NODE_ENV === 'production') {
    res.setHeader('Expect-CT', 'max-age=86400, enforce');
  }
  
  next();
};

/**
 * Request size limiter - prevents large payload attacks
 */
export const requestSizeLimiter = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength, 10);
      const maxSizeInBytes = parseSize(maxSize);
      
      if (sizeInBytes > maxSizeInBytes) {
        res.status(413).json({
          success: false,
          error: {
            code: 'PAYLOAD_TOO_LARGE',
            message: `Request body exceeds maximum size of ${maxSize}`,
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }
    }
    
    next();
  };
};

/**
 * Parse size string to bytes
 */
const parseSize = (size: string): number => {
  const units: { [key: string]: number } = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };
  
  const match = size.toLowerCase().match(/^(\d+)(b|kb|mb|gb)?$/);
  if (!match) return 10 * 1024 * 1024; // Default 10MB
  
  const value = parseInt(match[1], 10);
  const unit = match[2] || 'b';
  
  return value * units[unit];
};

/**
 * IP whitelist middleware for admin routes (optional)
 */
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip in development
    if (config.NODE_ENV !== 'production' || allowedIPs.length === 0) {
      next();
      return;
    }
    
    const clientIP = req.ip || req.socket.remoteAddress || '';
    
    // Check if IP is in whitelist
    const isAllowed = allowedIPs.some(ip => {
      // Support CIDR notation in the future
      return clientIP === ip || clientIP.endsWith(ip);
    });
    
    if (!isAllowed) {
      res.status(403).json({
        success: false,
        error: {
          code: 'IP_NOT_ALLOWED',
          message: 'Access denied from this IP address',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
    
    next();
  };
};

/**
 * Suspicious request detector
 * Detects and blocks potentially malicious requests
 */
export const suspiciousRequestDetector = (req: Request, res: Response, next: NextFunction): void => {
  const suspiciousPatterns = [
    /(\.\.|\/\/)/,  // Path traversal
    /<script/i,     // XSS attempt in URL
    /union.*select/i, // SQL injection
    /eval\s*\(/i,   // Code injection
    /javascript:/i, // JavaScript protocol
    /data:text\/html/i, // Data URI XSS
  ];
  
  const url = req.url;
  const userAgent = req.headers['user-agent'] || '';
  
  // Check URL for suspicious patterns
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url)) {
      console.warn(`⚠️ Suspicious request blocked: ${req.method} ${url} from ${req.ip}`);
      res.status(400).json({
        success: false,
        error: {
          code: 'SUSPICIOUS_REQUEST',
          message: 'Request blocked due to suspicious content',
          timestamp: new Date().toISOString(),
        },
      });
      return;
    }
  }
  
  // Block requests with no user agent (often bots)
  if (!userAgent && config.NODE_ENV === 'production') {
    console.warn(`⚠️ Request without user agent blocked: ${req.method} ${url} from ${req.ip}`);
    res.status(400).json({
      success: false,
      error: {
        code: 'MISSING_USER_AGENT',
        message: 'User-Agent header is required',
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }
  
  next();
};
