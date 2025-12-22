import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  private notificationService = new NotificationService();

  async getNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const notifications = await this.notificationService.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  async createNotification(req: Request, res: Response) {
    try {
      const { userId, message } = req.body;
      
      if (!userId || !message) {
        return res.status(400).json({ error: 'userId and message are required' });
      }

      const notification = await this.notificationService.createNotification(userId, message);
      res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const success = await this.notificationService.markAsRead(notificationId, userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Notification not found or access denied' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ error: 'Failed to update notification' });
    }
  }

  async getRecentNotifications(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const notifications = await this.notificationService.getRecentNotifications(limit);
      res.json(notifications);
    } catch (error) {
      console.error('Error getting recent notifications:', error);
      res.status(500).json({ error: 'Failed to fetch recent notifications' });
    }
  }
}
