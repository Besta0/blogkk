import { Request, Response, NextFunction } from 'express';
import { NewsletterService } from '../services/newsletter.service';
import { ResponseUtil } from '../utils/response';

export class NewsletterController {
  /**
   * Subscribe to newsletter (public endpoint)
   * POST /api/newsletter/subscribe
   */
  static async subscribe(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;

      // Validate email
      if (!email) {
        ResponseUtil.badRequest(res, 'Email is required');
        return;
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        ResponseUtil.validationError(res, 'Invalid email format');
        return;
      }

      const result = await NewsletterService.subscribe(email);

      if (result.isNew) {
        ResponseUtil.success(res, { 
          message: '订阅成功！感谢您的订阅。',
          subscribed: true 
        }, 201);
      } else {
        ResponseUtil.success(res, { 
          message: '您已经订阅过了。',
          subscribed: true 
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unsubscribe from newsletter using token (public endpoint)
   * POST /api/newsletter/unsubscribe
   */
  static async unsubscribe(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        ResponseUtil.badRequest(res, 'Unsubscribe token is required');
        return;
      }

      const subscriber = await NewsletterService.unsubscribe(token);

      if (!subscriber) {
        ResponseUtil.notFound(res, 'Invalid or expired unsubscribe link');
        return;
      }

      ResponseUtil.success(res, { 
        message: '您已成功取消订阅。',
        unsubscribed: true 
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all subscribers (admin only)
   * GET /api/newsletter/subscribers
   */
  static async getSubscribers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await NewsletterService.getSubscribers(page, limit);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subscriber count (admin only)
   * GET /api/newsletter/count
   */
  static async getSubscriberCount(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const count = await NewsletterService.getSubscriberCount();
      ResponseUtil.success(res, { count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unsubscribe by email (admin only)
   * DELETE /api/newsletter/subscribers/:email
   */
  static async unsubscribeByEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const email = req.params.email as string;

      const success = await NewsletterService.unsubscribe(email);

      if (!success) {
        ResponseUtil.notFound(res, 'Subscriber not found or already unsubscribed');
        return;
      }

      ResponseUtil.success(res, { 
        message: 'Subscriber unsubscribed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
