import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { ResponseUtil } from '../utils/response';

export class AnalyticsController {
  /**
   * Record a page view (public endpoint)
   * POST /api/analytics/view
   */
  static async recordView(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, sessionId } = req.body;

      if (!page) {
        ResponseUtil.badRequest(res, 'Page is required');
        return;
      }

      if (typeof page !== 'string' || page.length > 500) {
        ResponseUtil.validationError(res, 'Invalid page value');
        return;
      }

      // Get client IP (handles proxies)
      const ip = (req.ip || req.socket.remoteAddress || 'unknown').replace('::ffff:', '');
      const userAgent = req.get('User-Agent');
      const referrer = req.get('Referer') || req.get('Referrer');

      const pageView = await AnalyticsService.recordPageView({
        page: page.trim(),
        userAgent,
        referrer,
        ip,
        sessionId,
      });

      ResponseUtil.success(res, { id: pageView._id }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Record a project interaction (public endpoint)
   * POST /api/analytics/interaction
   */
  static async recordInteraction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { projectId, type } = req.body;

      if (!projectId || !type) {
        ResponseUtil.badRequest(res, 'Project ID and type are required');
        return;
      }

      if (!['view', 'like', 'share'].includes(type)) {
        ResponseUtil.validationError(res, 'Invalid interaction type');
        return;
      }

      // Get client IP
      const ip = (req.ip || req.socket.remoteAddress || 'unknown').replace('::ffff:', '');
      const userAgent = req.get('User-Agent');

      // For likes, check if already liked from this IP
      if (type === 'like') {
        const hasLiked = await AnalyticsService.hasLikedProject(projectId, ip);
        if (hasLiked) {
          ResponseUtil.conflict(res, 'Already liked this project');
          return;
        }
      }

      const interaction = await AnalyticsService.recordProjectInteraction({
        projectId,
        type,
        ip,
        userAgent,
      });

      ResponseUtil.success(res, { id: interaction._id }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get page view statistics (admin only)
   * GET /api/analytics/stats
   */
  static async getStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          ResponseUtil.validationError(res, 'Invalid start date');
          return;
        }
      }

      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          ResponseUtil.validationError(res, 'Invalid end date');
          return;
        }
      }

      const stats = await AnalyticsService.getPageViewStats(start, end);
      ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get project statistics (admin only)
   * GET /api/analytics/projects
   */
  static async getProjectStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { projectId } = req.query;
      const stats = await AnalyticsService.getProjectStats(projectId as string);
      ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent page views (admin only)
   * GET /api/analytics/views
   */
  static async getRecentViews(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

      const result = await AnalyticsService.getPageViews(page, limit);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get real-time statistics (admin only)
   * GET /api/analytics/realtime
   */
  static async getRealTimeStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await AnalyticsService.getRealTimeStats();
      ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export page views data as CSV (admin only)
   * GET /api/analytics/export/pageviews
   */
  static async exportPageViews(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          ResponseUtil.validationError(res, 'Invalid start date');
          return;
        }
      }

      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          ResponseUtil.validationError(res, 'Invalid end date');
          return;
        }
      }

      const csv = await AnalyticsService.exportPageViews(start, end);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=pageviews.csv');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export project interactions data as CSV (admin only)
   * GET /api/analytics/export/interactions
   */
  static async exportInteractions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          ResponseUtil.validationError(res, 'Invalid start date');
          return;
        }
      }

      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          ResponseUtil.validationError(res, 'Invalid end date');
          return;
        }
      }

      const csv = await AnalyticsService.exportInteractions(start, end);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=interactions.csv');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get aggregated statistics summary (admin only)
   * GET /api/analytics/summary
   */
  static async getSummary(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          ResponseUtil.validationError(res, 'Invalid start date');
          return;
        }
      }

      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          ResponseUtil.validationError(res, 'Invalid end date');
          return;
        }
      }

      const summary = await AnalyticsService.getSummary(start, end);
      ResponseUtil.success(res, summary);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user behavior statistics (admin only)
   * GET /api/analytics/behavior
   */
  static async getUserBehavior(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          ResponseUtil.validationError(res, 'Invalid start date');
          return;
        }
      }

      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          ResponseUtil.validationError(res, 'Invalid end date');
          return;
        }
      }

      const behavior = await AnalyticsService.getUserBehaviorStats(start, end);
      ResponseUtil.success(res, behavior);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get interaction trends (admin only)
   * GET /api/analytics/trends
   */
  static async getInteractionTrends(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      let start: Date | undefined;
      let end: Date | undefined;

      if (startDate) {
        start = new Date(startDate as string);
        if (isNaN(start.getTime())) {
          ResponseUtil.validationError(res, 'Invalid start date');
          return;
        }
      }

      if (endDate) {
        end = new Date(endDate as string);
        if (isNaN(end.getTime())) {
          ResponseUtil.validationError(res, 'Invalid end date');
          return;
        }
      }

      const trends = await AnalyticsService.getInteractionTrends(start, end);
      ResponseUtil.success(res, trends);
    } catch (error) {
      next(error);
    }
  }
}
