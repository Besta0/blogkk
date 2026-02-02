import { MySQLDataSource } from '../config/database';
import { Newsletter } from '../models/newsletter.model';

export class NewsletterService {
  private static get repository() {
    return MySQLDataSource.getRepository(Newsletter);
  }

  static async subscribe(email: string): Promise<{ newsletter: Newsletter; isNew: boolean }> {
    const existing = await this.repository.findOne({ where: { email: email.toLowerCase() } });

    if (existing) {
      if (!existing.subscribed) {
        existing.subscribed = true;
        existing.subscribedAt = new Date();
        existing.unsubscribedAt = undefined;
        await this.repository.save(existing);
      }
      return { newsletter: existing, isNew: false };
    }

    const newsletter = this.repository.create({
      email: email.toLowerCase(),
      subscribed: true,
      subscribedAt: new Date(),
    });
    await this.repository.save(newsletter);

    return { newsletter, isNew: true };
  }

  static async unsubscribe(email: string): Promise<boolean> {
    const newsletter = await this.repository.findOne({ where: { email: email.toLowerCase() } });

    if (!newsletter || !newsletter.subscribed) {
      return false;
    }

    newsletter.subscribed = false;
    newsletter.unsubscribedAt = new Date();
    await this.repository.save(newsletter);

    return true;
  }

  static async getSubscribers(page: number = 1, limit: number = 50): Promise<{
    subscribers: Newsletter[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [subscribers, total] = await this.repository.findAndCount({
      where: { subscribed: true },
      order: { subscribedAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      subscribers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getSubscriberCount(): Promise<number> {
    return this.repository.count({ where: { subscribed: true } });
  }

  static async isSubscribed(email: string): Promise<boolean> {
    const newsletter = await this.repository.findOne({
      where: { email: email.toLowerCase(), subscribed: true },
    });
    return !!newsletter;
  }
}
