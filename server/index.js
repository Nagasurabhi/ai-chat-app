
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
console.log("ENV PATH TEST");
console.log("KEY:", process.env.GEMINI_API_KEY);

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import { createServer } from "http";
import { Server } from "socket.io";


// Connect DB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);

// Test route (optional but useful)
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Create HTTP server
const server = createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// Store online users
const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user
  socket.on("join", (userId) => {
    users[userId] = socket.id;
  });

  // Typing event
socket.on("typing", ({ senderId, receiverId }) => {
  const receiverSocket = users[receiverId];

  if (receiverSocket) {
    io.to(receiverSocket).emit("typing", {
      senderId
    });
  }
});

// Stop typing event
socket.on("stopTyping", ({ senderId, receiverId }) => {
  const receiverSocket = users[receiverId];

  if (receiverSocket) {
    io.to(receiverSocket).emit("stopTyping", {
      senderId
    });
  }
});

  // Send message (real-time)
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
  const receiverSocket = users[receiverId];

  const msgData = {
    senderId,
    receiverId,
    message
  };

  // ✅ Send to receiver
  if (receiverSocket) {
    io.to(receiverSocket).emit("receiveMessage", msgData);
  }

  // ✅ Send back to sender
  socket.emit("receiveMessage", msgData);
});

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Optional cleanup (good practice)
    for (const userId in users) {
      if (users[userId] === socket.id) {
        delete users[userId];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});