import { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Container } from '@mui/material';
import { NotificationItem } from './NotificationItem';
import { notificationService, Notification } from '../services/api';

type NotificationsListProps = {
  userId: string;
};

export const NotificationsList = ({ userId }: NotificationsListProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(userId);
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId, userId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
        <Button onClick={fetchNotifications} color="inherit" size="small">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Container maxWidth="md">
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" component="h1">
          Notifications
        </Typography>
        <Button 
          variant="outlined" 
          onClick={fetchNotifications}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {notifications.length === 0 ? (
        <Box textAlign="center" my={4}>
          <Typography variant="body1" color="text.secondary">
            No notifications to display
          </Typography>
        </Box>
      ) : (
        <Box>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};
