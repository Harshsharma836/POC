import { Box, Typography, Paper, IconButton, Tooltip } from '@mui/material';
import { CheckCircle as ReadIcon, Circle as UnreadIcon } from '@mui/icons-material';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        mb: 1, 
        bgcolor: notification.read ? 'background.paper' : 'action.hover',
        position: 'relative',
        transition: 'background-color 0.2s',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.selected',
        },
      }}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="body1">{notification.message}</Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDate(notification.createdAt)}
          </Typography>
        </Box>
        {!notification.read ? (
          <Tooltip title="Mark as read">
            <IconButton size="small">
              <UnreadIcon color="primary" fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
            <ReadIcon color="action" fontSize="small" />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default NotificationItem;
