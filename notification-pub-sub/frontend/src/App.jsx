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
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

const API_URL = "http://localhost:3000/api/notifications";
const SOCKET_URL = "http://localhost:3000";

export default function App() {
  const [userId, setUserId] = useState("test-user-123");
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const s = io(SOCKET_URL);
    setSocket(s);
    s.on("notify", (n) => setNotifications((prev) => [n, ...prev]));
    return () => s.disconnect();
  }, []);

  const joinRoom = () => {
    socket?.emit("join", userId);
    setToast(true);
  };

  const loadNotifications = async () => {
    setLoading(true);
    const res = await axios.get(`${API_URL}/user/${userId}`);
    setNotifications(res.data);
    setLoading(false);
  };

  const sendNotification = async () => {
    if (!message.trim()) return;
    setLoading(true);
    await axios.post(API_URL, { userId, message });
    setMessage("");
    setLoading(false);
  };

  const markAsRead = async (id) => {
    await axios.patch(`${API_URL}/${id}/read`, { userId });
    loadNotifications();
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0d1117",
        py: 6,
        display: "flex",
        alignItems: "center",
      }}
    >
      <Container maxWidth="sm">
        {/* HEADER */}
        <Stack alignItems="center" gap={1} mb={4}>
          <NotificationsNoneIcon sx={{ fontSize: 44, color: "#58a6ff" }} />
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#e6edf3", letterSpacing: -0.5 }}
          >
            Notification Center
          </Typography>
          {unread > 0 && (
            <Chip
              label={`${unread} unread`}
              size="small"
              sx={{
                background: "#ff4d4f",
                color: "white",
                fontWeight: 600,
                mt: 1,
              }}
            />
          )}
        </Stack>

        {/* USER SETUP */}
        <Card
          sx={{
            p: 3,
            mb: 3,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            borderRadius: "18px",
          }}
        >
          <Stack spacing={2}>
            <TextField
              label="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              fullWidth
              sx={{
                "& input": { color: "#e6edf3" },
                "& label": { color: "#8b949e" },
              }}
            />
            <Button fullWidth variant="contained" onClick={joinRoom}>
              Join Room
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={loadNotifications}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load Notifications"}
            </Button>
          </Stack>
        </Card>

        {/* SEND MESSAGE */}
        <Card
          sx={{
            p: 3,
            mb: 3,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(12px)",
            borderRadius: "18px",
          }}
        >
          <Stack spacing={2}>
            <TextField
              label="Message"
              multiline
              rows={2}
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendNotification()}
              sx={{
                "& input, & textarea": { color: "#e6edf3" },
                "& label": { color: "#8b949e" },
              }}
            />
            <Button
              variant="contained"
              fullWidth
              disabled={!message.trim() || loading}
              onClick={sendNotification}
            >
              {loading ? "Sending..." : "Send Notification"}
            </Button>
          </Stack>
        </Card>

        {/* LIST */}
        <Stack spacing={2}>
          {notifications.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: "#8b949e" }}>
              No notifications yet.
            </Typography>
          ) : (
            notifications.map((n) => (
              <Card
                key={n.id}
                sx={{
                  p: 2.2,
                  background: n.read
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(88,166,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  transition: "0.25s",
                  "&:hover": { transform: "translateY(-2px)", opacity: 0.95 },
                }}
              >
                <Typography sx={{ fontWeight: 600, color: "#e6edf3" }}>
                  {n.data?.title || "Notification"}
                </Typography>
                <Typography sx={{ mt: 0.6, mb: 1, color: "#9da6af" }}>
                  {n.data?.message || n.message}
                </Typography>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" sx={{ color: "#8b949e" }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </Typography>
                  {!n.read ? (
                    <Button
                      size="small"
                      onClick={() => markAsRead(n.id)}
                      startIcon={<DoneAllIcon />}
                    >
                      Mark Read
                    </Button>
                  ) : (
                    <DoneAllIcon sx={{ fontSize: 20, color: "#8b949e" }} />
                  )}
                </Stack>
              </Card>
            ))
          )}
        </Stack>

        {/* JOIN POPUP */}
        <Snackbar
          open={toast}
          autoHideDuration={1800}
          onClose={() => setToast(false)}
        >
          <Alert severity="success" sx={{ fontWeight: 600 }}>
            🔥 Joined Room Successfully
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}
