import { MySQLDataSource } from '../config/database';
import { ContactMessage } from '../models/contactMessage.model';

export class ContactService {
  private static get repository() {
    return MySQLDataSource.getRepository(ContactMessage);
  }

  static async createMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<ContactMessage> {
    const contactMessage = this.repository.create(data);
    return this.repository.save(contactMessage);
  }

  static async getMessages(page: number = 1, limit: number = 20): Promise<{
    messages: ContactMessage[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [messages, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      messages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getMessageById(id: string): Promise<ContactMessage | null> {
    return this.repository.findOne({ where: { id } });
  }

  static async markAsRead(id: string): Promise<ContactMessage | null> {
    const message = await this.getMessageById(id);
    if (!message) {
      return null;
    }

    message.read = true;
    return this.repository.save(message);
  }

  static async markAsReplied(id: string): Promise<ContactMessage | null> {
    const message = await this.getMessageById(id);
    if (!message) {
      return null;
    }

    message.replied = true;
    return this.repository.save(message);
  }

  static async deleteMessage(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }

  static async getUnreadCount(): Promise<number> {
    return this.repository.count({ where: { read: false } });
  }
}
