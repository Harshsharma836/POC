import { useState, useEffect } from 'react';
import { 
  Badge, 
  IconButton, 
  Popover, 
  Box, 
  Typography, 
  Divider,
  Button,
  List,
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { notificationService } from '../services/api';
import NotificationItem from './NotificationItem';

const NotificationBell = ({ userId }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const open = Boolean(anchorEl);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(userId);
      if (data && Array.isArray(data)) {
        setNotifications(data);
        setError(null);
      } else {
        console.error('Unexpected response format:', data);
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message || 'Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const updatedNotification = await notificationService.markAsRead(notificationId, userId);
      if (updatedNotification && updatedNotification.id) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (!open) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = notifications.slice(0, 5);

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: { 
            width: 360,
            maxHeight: 500,
            overflow: 'auto',
            p: 1 
          }
        }}
      >
        <Box p={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Notifications</Typography>
            <Button 
              size="small" 
              onClick={fetchNotifications}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : null}
            >
              Refresh
            </Button>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          {loading && notifications.length === 0 ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={24} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box p={2} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                No notifications to display
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
              {notifications.length > 5 && (
                <Box textAlign="center" mt={1}>
                  <Button size="small" onClick={handleClose}>
                    View All Notifications
                  </Button>
                </Box>
              )}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
