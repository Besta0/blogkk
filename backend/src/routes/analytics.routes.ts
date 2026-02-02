import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public endpoints - record analytics data
router.post('/view', AnalyticsController.recordView);
router.post('/interaction', AnalyticsController.recordInteraction);

// Admin-only endpoints - view analytics data
router.get('/stats', authenticate, requireAdmin, AnalyticsController.getStats);
router.get('/projects', authenticate, requireAdmin, AnalyticsController.getProjectStats);
router.get('/views', authenticate, requireAdmin, AnalyticsController.getRecentViews);
router.get('/realtime', authenticate, requireAdmin, AnalyticsController.getRealTimeStats);
router.get('/summary', authenticate, requireAdmin, AnalyticsController.getSummary);
router.get('/behavior', authenticate, requireAdmin, AnalyticsController.getUserBehavior);
router.get('/trends', authenticate, requireAdmin, AnalyticsController.getInteractionTrends);

// Admin-only endpoints - export data
router.get('/export/pageviews', authenticate, requireAdmin, AnalyticsController.exportPageViews);
router.get('/export/interactions', authenticate, requireAdmin, AnalyticsController.exportInteractions);

export default router;
