import { useState } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box,
  IconButton,
  Tooltip
} from '@mui/material';
import { Notifications as NotificationsIcon, Brightness4, Brightness7 } from '@mui/icons-material';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationBell } from './components/NotificationBell';

// Mock user ID - in a real app, this would come from authentication
const USER_ID = 'user-123';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <NotificationProvider userId={USER_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <NotificationsIcon sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Notification System
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
                  <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 1 }}>
                    {darkMode ? <Brightness7 /> : <Brightness4 />}
                  </IconButton>
                </Tooltip>
                
                <NotificationBell />
              </Box>
            </Toolbar>
          </AppBar>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to the Notification System
            </Typography>
            <Typography variant="body1" paragraph>
              This is a demo of a real-time notification system. Click the bell icon in the top-right
              corner to view your notifications.
            </Typography>
          </Box>
          
          {/* Example content */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Recent Activity
            </Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'background.paper', 
              borderRadius: 1,
              boxShadow: 1
            }}>
              <Typography variant="body1">
                Your notifications will appear in the notification dropdown. Try sending a new notification
                from the backend to see it appear here in real-time!
              </Typography>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default App;
