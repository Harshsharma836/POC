import { Server, Socket } from "socket.io";
import Redis from "ioredis";

export const setupSocket = (io: Server) => {
  // Redis publisher and subscriber
  const pubClient = new Redis({
    host: "localhost",
    port: 6379,
  });

  const subClient = new Redis({
    host: "localhost",
    port: 6379,
  });

  console.log("🟢 Redis clients created");

  // Subscribe when Redis is ready
  subClient.on("ready", () => {
    console.log("🔄 Redis SUB connected");

    subClient.subscribe("new_notification", (err, count) => {
      if (err) {
        console.error("❌ Error subscribing:", err);
        return;
      }
      console.log("📌 Subscribed to `new_notification` channel");
    });
  });

  // Receive messages from Redis
  subClient.on("message", (channel: string, message: string) => {
    if (channel !== "new_notification") return;

    console.log("📥 Message received:", message);
    try {
      const { userId, notification } = JSON.parse(message);
      io.to(`user:${userId}`).emit("notify", notification);
      console.log(`📨 Emitted notification to user:${userId}`);
    } catch (error) {
      console.error("⚠ Error parsing Redis message:", error);
    }
  });

  // Socket connection handler
  io.on("connection", (socket: Socket) => {
    console.log("🟢 Client connected:", socket.id);

    socket.on("join", (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} joined room user:${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });

  return io;
};
