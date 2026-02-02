import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

/**
 * Middleware to automatically track page views for API requests
 * This is optional and can be applied to specific routes
 */
export const trackPageView = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Only track GET requests (page views)
  if (req.method !== 'GET') {
    next();
    return;
  }

  // Skip tracking for certain paths
  const skipPaths = ['/health', '/api/analytics', '/api/auth'];
  if (skipPaths.some(path => req.path.startsWith(path))) {
    next();
    return;
  }

  // Get client IP (handles proxies)
  const ip = (req.ip || req.socket.remoteAddress || 'unknown').replace('::ffff:', '');
  const userAgent = req.get('User-Agent');
  const referrer = req.get('Referer') || req.get('Referrer');

  // Record page view asynchronously (non-blocking)
  AnalyticsService.recordPageView({
    page: req.path,
    userAgent,
    referrer,
    ip,
  }).catch((error) => {
    console.error('Failed to record page view:', error);
  });

  next();
};

/**
 * Middleware to track project views automatically
 * Apply to project detail routes
 */
export const trackProjectView = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const projectIdParam = req.params.id;
  
  // Handle case where id might be an array (shouldn't happen but TypeScript requires it)
  const projectId = Array.isArray(projectIdParam) ? projectIdParam[0] : projectIdParam;
  
  if (!projectId) {
    next();
    return;
  }

  // Get client IP
  const ip = (req.ip || req.socket.remoteAddress || 'unknown').replace('::ffff:', '');
  const userAgent = req.get('User-Agent');

  // Record project view asynchronously (non-blocking)
  AnalyticsService.recordProjectInteraction({
    projectId,
    type: 'view',
    ip,
    userAgent,
  }).catch((error) => {
    console.error('Failed to record project view:', error);
  });

  next();
};
