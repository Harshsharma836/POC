import { AppDataSource } from '../config/database';
import { Notification } from '../models/notification.model';
import { createClient } from 'redis';

export class NotificationService {
  private notificationRepository = AppDataSource.getRepository(Notification);
  private redisClient: any;
  private isRedisConnected = false;

  constructor() {
    this.initializeRedis().catch(console.error);
  }

  private async initializeRedis() {
    try {
      this.redisClient = createClient({
        url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      });

      this.redisClient.on('connect', () => {
        console.log('Redis Publisher Connected');
        this.isRedisConnected = true;
      });

      this.redisClient.on('error', (err: any) => {
        console.error('Redis Publisher Error:', err);
        this.isRedisConnected = false;
      });

      await this.redisClient.connect();
    } catch (error) {
      console.error('Failed connecting Redis:', error);
      this.isRedisConnected = false;
    }
  }

  private async ensureRedisConnection() {
    if (!this.redisClient || !this.isRedisConnected) {
      console.log('⚠ Redis disconnected — retrying…');
      await this.initializeRedis();
    }
    return this.isRedisConnected;
  }

  async createNotification(userId: string, message: string) {
    try {
      const notification = this.notificationRepository.create({
        userId,
        data: {
          title: 'New Notification',
          message,
          type: 'info',
        },
        read: false,
      });

      const savedNotification = await this.notificationRepository.save(notification);

      if (await this.ensureRedisConnection()) {
        try {
          await this.redisClient.publish(
            'new_notification',
            JSON.stringify({
              userId,
              notification: savedNotification,
            })
          );
          console.log('📤 Notification Published to Redis');

          await this.redisClient.lPush('recent_notifications', JSON.stringify(savedNotification));
          await this.redisClient.lTrim('recent_notifications', 0, 49);
        } catch (err) {
          console.error('Redis publish/list failure:', err);
        }
      }

      return savedNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getUserNotifications(userId: string) {
    if (await this.ensureRedisConnection()) {
      try {
        const cacheKey = `user:${userId}:notifications`;
        const cached = await this.redisClient.get(cacheKey);
        if (cached) return JSON.parse(cached);
      } catch {}
    }

    const notifications = await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });

    if (this.isRedisConnected) {
      const cacheKey = `user:${userId}:notifications`;
      await this.redisClient.setEx(cacheKey, 60, JSON.stringify(notifications));
    }

    return notifications;
  }

  async markAsRead(notificationId: string, userId: string) {
    const result = await this.notificationRepository.update(
      { id: notificationId, userId },
      { read: true }
    );

    if (await this.ensureRedisConnection()) {
      const cacheKey = `user:${userId}:notifications`;
      await this.redisClient.del(cacheKey);
    }

    return (result.affected ?? 0) > 0;
  }

  async getRecentNotifications(limit: number = 10) {
    if (await this.ensureRedisConnection()) {
      try {
        const notifications = await this.redisClient.lRange('recent_notifications', 0, limit - 1);
        return notifications.map((n: string) => JSON.parse(n));
      } catch {}
    }

    return await this.notificationRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
