import { Router } from 'express';
import { ContactController } from '../controllers/contact.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { 
  contactRateLimiter, 
  validate, 
  contactValidationRules,
  validateUUID 
} from '../middleware';

const router = Router();

// Public endpoint - submit contact message (with rate limiting and validation)
router.post('/', contactRateLimiter, validate(contactValidationRules), ContactController.submitMessage);

// Admin-only endpoints
router.get('/', authenticate, requireAdmin, ContactController.getMessages);
router.get('/:id', authenticate, requireAdmin, validateUUID('id'), ContactController.getMessage);
router.patch('/:id/read', authenticate, requireAdmin, validateUUID('id'), ContactController.markAsRead);
router.patch('/:id/replied', authenticate, requireAdmin, validateUUID('id'), ContactController.markAsReplied);
router.delete('/:id', authenticate, requireAdmin, validateUUID('id'), ContactController.deleteMessage);

export default router;
