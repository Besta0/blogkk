import { Request, Response, NextFunction } from 'express';
import { ContactService } from '../services/contact.service';
import { ResponseUtil } from '../utils/response';

export class ContactController {
  /**
   * Submit a contact message (public endpoint)
   * POST /api/contact
   */
  static async submitMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !email || !subject || !message) {
        ResponseUtil.badRequest(res, 'All fields are required', {
          required: ['name', 'email', 'subject', 'message'],
        });
        return;
      }

      // Validate email format
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        ResponseUtil.validationError(res, 'Invalid email format');
        return;
      }

      // Validate field lengths
      if (name.length > 100) {
        ResponseUtil.validationError(res, 'Name cannot exceed 100 characters');
        return;
      }
      if (subject.length > 200) {
        ResponseUtil.validationError(res, 'Subject cannot exceed 200 characters');
        return;
      }
      if (message.length > 5000) {
        ResponseUtil.validationError(res, 'Message cannot exceed 5000 characters');
        return;
      }

      const contactMessage = await ContactService.createMessage({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
      });

      ResponseUtil.success(res, contactMessage, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all contact messages (admin only)
   * GET /api/contact
   */
  static async getMessages(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await ContactService.getMessages(page, limit);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single message by ID (admin only)
   * GET /api/contact/:id
   */
  static async getMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const message = await ContactService.getMessageById(id);

      if (!message) {
        ResponseUtil.notFound(res, 'Message not found');
        return;
      }

      ResponseUtil.success(res, message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a message as read (admin only)
   * PATCH /api/contact/:id/read
   */
  static async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const message = await ContactService.markAsRead(id);

      if (!message) {
        ResponseUtil.notFound(res, 'Message not found');
        return;
      }

      ResponseUtil.success(res, message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark a message as replied (admin only)
   * PATCH /api/contact/:id/replied
   */
  static async markAsReplied(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const message = await ContactService.markAsReplied(id);

      if (!message) {
        ResponseUtil.notFound(res, 'Message not found');
        return;
      }

      ResponseUtil.success(res, message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a message (admin only)
   * DELETE /api/contact/:id
   */
  static async deleteMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const deleted = await ContactService.deleteMessage(id);

      if (!deleted) {
        ResponseUtil.notFound(res, 'Message not found');
        return;
      }

      ResponseUtil.success(res, { message: 'Message deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
