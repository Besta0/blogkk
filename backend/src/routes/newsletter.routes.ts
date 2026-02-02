import { Router } from 'express';
import { NewsletterController } from '../controllers/newsletter.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { 
  newsletterRateLimiter, 
  validate, 
  newsletterValidationRules 
} from '../middleware';

const router = Router();

// Public endpoints (with rate limiting and validation)
router.post('/subscribe', newsletterRateLimiter, validate(newsletterValidationRules), NewsletterController.subscribe);
router.post('/unsubscribe', newsletterRateLimiter, validate(newsletterValidationRules), NewsletterController.unsubscribe);

// Admin-only endpoints
router.get('/subscribers', authenticate, requireAdmin, NewsletterController.getSubscribers);
router.get('/count', authenticate, requireAdmin, NewsletterController.getSubscriberCount);
router.delete('/subscribers/:email', authenticate, requireAdmin, NewsletterController.unsubscribeByEmail);

export default router;
