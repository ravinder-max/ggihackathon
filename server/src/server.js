import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import recordsRouter from "./routes/records.js";
import aiRouter from "./routes/ai.js";
import emergencyRouter from "./routes/emergency.js";
import authRouter from "./routes/auth.js";
import { env } from "./config/env.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import jwt from "jsonwebtoken";

const app = express();
const httpServer = createServer(app);

// Socket.IO setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store io instance globally for use in routes
app.set("io", io);

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/records", authMiddleware, recordsRouter);
app.use("/api/ai", authMiddleware, aiRouter);
app.use("/api/emergency", authMiddleware, emergencyRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "medledger-server" });
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication required"));
  }
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    next();
  } catch (error) {
    next(new Error("Invalid token"));
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId} (${socket.userRole})`);
  
  // Join user-specific room for targeted notifications
  socket.join(`user:${socket.userId}`);
  
  // If user is a doctor, join doctor room
  if (socket.userRole === "doctor") {
    socket.join("doctors");
  }
  
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

async function start() {
  await mongoose.connect(env.mongoUri);
  httpServer.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
    console.log(`Socket.IO server ready`);
  });
}

start().catch(error => {
  console.error("Server startup failed", error);
  process.exit(1);
});

export { io };
