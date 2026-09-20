import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

// Routes Imports
import activityRoutes from "./Routes/activityRoutes.js";
import aiTreatmentRoutes from "./Routes/AiTreatmentRoute.js";
import alertRoutes from "./Routes/alertRoutes.js";
import articleRoutes from "./Routes/articleRoutes.js";
import diseaseRoutes from "./Routes/diseaseRoutes.js";
import farmerFormRoutes from "./Routes/FarmerFormRoutes.js";
import managerRoutes from "./Routes/ManagerRoutes.js";
import materialRoutes from "./Routes/MaterialRoute.js";
import testRoutes from "./Routes/testRoute.js";
import userRoutes from "./Routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 5557;

// 1. Create HTTP Server for Socket.io
const server = http.createServer(app);

// 2. Initialize Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Real-time Disease Report Broadcast Setup
io.on("connection", (socket) => {
  console.log("⚡ Farmer connected to Real-Time Map:", socket.id);

  // Jab koi farmer new report submit karega
  socket.on("new_disease_report", (reportData) => {
    console.log("📡 New Disease Reported:", reportData.disease, "in", reportData.region);
    // Sabhi connected clients ke map par real-time broadcast bhej do
    io.emit("receive_disease_report", reportData);
  });

  socket.on("disconnect", () => {
    console.log("❌ Farmer disconnected:", socket.id);
  });
});

// Middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AgriGuard Backend is running with Real-Time Sockets",
  });
});

// API Routes Mounting
app.use("/api/activity", activityRoutes);
app.use("/api/ai", aiTreatmentRoutes);
app.use("/api/ai-treatment", aiTreatmentRoutes);
app.use("/api/alert", alertRoutes);
app.use("/api/article", articleRoutes);
app.use("/api/disease", diseaseRoutes);
app.use("/api/farmer-form", farmerFormRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/material", materialRoutes);
app.use("/api/test", testRoutes);
app.use("/api/user", userRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong on the server!",
    error: err.message,
  });
});

// 3. Start Server with Socket.io Enabled (server.listen instead of app.listen)
server.listen(PORT, () => {
  console.log(`🚀 Real-Time Server running on port: ${PORT}`);
});

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((error) => console.error("❌ MongoDB connection error:", error.message));
} else {
  console.warn("⚠️ MONGODB_URI missing in .env file");
}