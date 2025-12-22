import { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  Badge,
  Chip,
  alpha,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import SendIcon from "@mui/icons-material/Send";

const API_URL = "http://localhost:3000/api/notifications";
const SOCKET_URL = "http://localhost:3000";

export default function App() {
  const [userId, setUserId] = useState("test-user-123");
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);
    s.on("notify", (notification) =>
      setNotifications((prev) => [notification, ...prev])
    );
    return () => s.disconnect();
  }, []);

  const joinRoom = () => socket?.emit("join", userId);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/user/${userId}`);
      setNotifications(res.data);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await axios.post(API_URL, { userId, message });
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/read`, { userId });
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        minHeight: "100vh",
        py: 4,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          right: "-50%",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle, rgba(30, 144, 255, 0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        {/* HEADER */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={2}
          mb={5}
          sx={{
            animation: "slideDown 0.6s ease-out",
            "@keyframes slideDown": {
              from: { opacity: 0, transform: "translateY(-20px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            overlap="circular"
            sx={{
              "& .MuiBadge-badge": {
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                boxShadow: "0 0 12px rgba(239, 68, 68, 0.5)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: "16px",
                background: "linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)",
                boxShadow: "0 8px 32px rgba(30, 144, 255, 0.3)",
              }}
            >
              <NotificationsActiveIcon
                sx={{ fontSize: 32, color: "#60a5fa" }}
              />
            </Box>
          </Badge>
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ color: "#f8fafc", letterSpacing: "-0.5px" }}
            >
              Notifications
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#94a3b8",
                fontWeight: 500,
                mt: 0.5,
              }}
            >
              Stay updated in real-time
            </Typography>
          </Box>
        </Stack>

        {/* USER SETUP CARD */}
        <Card
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: "20px",
            background: alpha("#1e293b", 0.8),
            backdropFilter: "blur(10px)",
            border: "1px solid " + alpha("#64748b", 0.2),
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: alpha("#1e293b", 0.9),
              border: "1px solid " + alpha("#64748b", 0.3),
              transform: "translateY(-2px)",
            },
            animation: "fadeInUp 0.6s ease-out 0.1s backwards",
            "@keyframes fadeInUp": {
              from: { opacity: 0, transform: "translateY(20px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: "#f8fafc",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      background:
                        "linear-gradient(180deg, #3b82f6 0%, #06b6d4 100%)",
                      borderRadius: 2,
                    }}
                  />
                  User Setup
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#f1f5f9",
                    borderRadius: "12px",
                    background: alpha("#0f172a", 0.5),
                    border: "1.5px solid " + alpha("#64748b", 0.3),
                    transition: "all 0.3s",
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover": {
                      background: alpha("#0f172a", 0.7),
                      borderColor: alpha("#3b82f6", 0.5),
                    },
                    "&.Mui-focused": {
                      background: alpha("#0f172a", 0.8),
                      borderColor: "#3b82f6",
                      boxShadow: "0 0 0 3px " + alpha("#3b82f6", 0.1),
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: alpha("#94a3b8", 0.5),
                    opacity: 1,
                  },
                  "& .MuiInputLabel-root": {
                    color: "#94a3b8",
                    "&.Mui-focused": {
                      color: "#3b82f6",
                    },
                  },
                }}
              />

              <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={joinRoom}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "white",
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: "12px",
                    textTransform: "none",
                    fontSize: "1rem",
                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(59, 130, 246, 0.4)",
                    },
                  }}
                >
                  Join Room
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={loadNotifications}
                  disabled={loading}
                  sx={{
                    borderColor: alpha("#3b82f6", 0.5),
                    color: "#3b82f6",
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: "12px",
                    textTransform: "none",
                    fontSize: "1rem",
                    transition: "all 0.3s",
                    "&:hover": {
                      background: alpha("#3b82f6", 0.1),
                      borderColor: "#3b82f6",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  {loading ? "Loading..." : "Load Notifications"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* SEND NOTIFICATION CARD */}
        <Card
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: "20px",
            background: alpha("#1e293b", 0.8),
            backdropFilter: "blur(10px)",
            border: "1px solid " + alpha("#64748b", 0.2),
            overflow: "hidden",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: alpha("#1e293b", 0.9),
              border: "1px solid " + alpha("#64748b", 0.3),
              transform: "translateY(-2px)",
            },
            animation: "fadeInUp 0.6s ease-out 0.2s backwards",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: "#f8fafc",
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 20,
                      background:
                        "linear-gradient(180deg, #10b981 0%, #059669 100%)",
                      borderRadius: 2,
                    }}
                  />
                  Send Notification
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendNotification()}
                placeholder="Type your message here..."
                variant="outlined"
                multiline
                rows={2}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#f1f5f9",
                    borderRadius: "12px",
                    background: alpha("#0f172a", 0.5),
                    border: "1.5px solid " + alpha("#64748b", 0.3),
                    transition: "all 0.3s",
                    "& fieldset": {
                      borderColor: "transparent",
                    },
                    "&:hover": {
                      background: alpha("#0f172a", 0.7),
                      borderColor: alpha("#3b82f6", 0.5),
                    },
                    "&.Mui-focused": {
                      background: alpha("#0f172a", 0.8),
                      borderColor: "#3b82f6",
                      boxShadow: "0 0 0 3px " + alpha("#3b82f6", 0.1),
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: alpha("#94a3b8", 0.5),
                    opacity: 1,
                  },
                  "& .MuiInputLabel-root": {
                    color: "#94a3b8",
                    "&.Mui-focused": {
                      color: "#3b82f6",
                    },
                  },
                }}
              />

              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={sendNotification}
                disabled={loading || !message.trim()}
                endIcon={<SendIcon />}
                sx={{
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  fontWeight: 600,
                  py: 2,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontSize: "1.1rem",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                  transition: "all 0.3s",
                  "&:hover:not(:disabled)": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(16, 185, 129, 0.4)",
                  },
                  "&:disabled": {
                    opacity: 0.5,
                  },
                }}
              >
                {loading ? "Sending..." : "Send Notification"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* NOTIFICATIONS LIST */}
        <Box
          sx={{
            animation: "fadeInUp 0.6s ease-out 0.3s backwards",
          }}
        >
          <Stack direction="row" alignItems="center" gap={2} mb={3}>
            <Box
              sx={{
                width: 4,
                height: 24,
                background: "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)",
                borderRadius: 2,
              }}
            />
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color: "#f8fafc" }}
            >
              Recent Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={`${unreadCount} unread`}
                size="small"
                sx={{
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  fontWeight: 600,
                  ml: "auto",
                }}
              />
            )}
          </Stack>

          <Stack spacing={2}>
            {notifications.length === 0 ? (
              <Card
                elevation={0}
                sx={{
                  borderRadius: "20px",
                  background: alpha("#1e293b", 0.5),
                  backdropFilter: "blur(10px)",
                  border: "1.5px dashed " + alpha("#64748b", 0.2),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 8,
                }}
              >
                <Typography
                  textAlign="center"
                  sx={{
                    color: "#64748b",
                    fontWeight: 500,
                  }}
                >
                  No notifications yet. Create one to get started!
                </Typography>
              </Card>
            ) : (
              notifications.map((n, index) => (
                <Card
                  key={n.id}
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    background: alpha("#1e293b", 0.8),
                    backdropFilter: "blur(10px)",
                    border: "1px solid " + alpha(n.read ? "#64748b" : "#f59e0b", 0.3),
                    borderLeft: `4px solid ${n.read ? "#64748b" : "#f59e0b"}`,
                    overflow: "hidden",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      background: alpha("#1e293b", 0.9),
                      transform: "translateX(4px)",
                      boxShadow: `0 8px 24px ${alpha("#000", 0.3)}`,
                    },
                    animation: `slideIn 0.4s ease-out ${0.35 + index * 0.05}s backwards`,
                    "@keyframes slideIn": {
                      from: {
                        opacity: 0,
                        transform: "translateX(-20px)",
                      },
                      to: { opacity: 1, transform: "translateX(0)" },
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          sx={{
                            color: "#f8fafc",
                            flex: 1,
                          }}
                        >
                          {n.data?.title || "Notification"}
                        </Typography>
                        {n.read && (
                          <DoneAllIcon
                            sx={{
                              fontSize: 20,
                              color: "#64748b",
                              ml: 1,
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Stack>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#cbd5e1",
                          lineHeight: 1.6,
                        }}
                      >
                        {n.data?.message || n.message}
                      </Typography>

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#94a3b8",
                            fontWeight: 500,
                          }}
                        >
                          {new Date(n.createdAt).toLocaleString()}
                        </Typography>

                        {!n.read && (
                          <Button
                            size="small"
                            startIcon={<DoneAllIcon />}
                            onClick={() => markAsRead(n.id)}
                            disabled={loading}
                            sx={{
                              color: "#10b981",
                              borderColor: alpha("#10b981", 0.5),
                              fontWeight: 600,
                              textTransform: "none",
                              transition: "all 0.3s",
                              "&:hover:not(:disabled)": {
                                background: alpha("#10b981", 0.1),
                                borderColor: "#10b981",
                              },
                            }}
                            variant="outlined"
                          >
                            Mark as Read
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}