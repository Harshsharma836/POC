import { useState, useRef, useEffect } from 'react';
import { 
  Badge, 
  IconButton, 
  Popover, 
  Box, 
  Typography, 
  Divider,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications } from '../contexts/NotificationContext';
import { NotificationItem } from './NotificationItem';

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, refreshNotifications } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [loading, setLoading] = useState(false);
  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => markAsRead(n.id))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshNotifications();
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const recentNotifications = notifications.slice(0, 5); // Show only 5 most recent

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
        aria-describedby={id}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
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
            <Box>
              <Button 
                size="small" 
                onClick={handleRefresh}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} /> : null}
              >
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button 
                  size="small" 
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  sx={{ ml: 1 }}
                >
                  Mark all as read
                </Button>
              )}
            </Box>
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
