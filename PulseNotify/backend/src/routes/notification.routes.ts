import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();
const notificationController = new NotificationController();

// Get notifications for a specific user
router.get('/user/:userId', (req, res) => notificationController.getNotifications(req, res));

// Create a new notification
router.post('/', (req, res) => notificationController.createNotification(req, res));

// Mark a notification as read
router.patch('/:notificationId/read', (req, res) => notificationController.markAsRead(req, res));

// Get unread notifications count
// router.get('/unread/:userId', (req, res) => notificationController.getUnreadCount(req, res));

// Get recent notifications (from Redis cache)
router.get('/recent', (req, res) => notificationController.getRecentNotifications(req, res));

export default router;