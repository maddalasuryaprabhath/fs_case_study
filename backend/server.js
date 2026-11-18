import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import studentRoutes from "./src/routes/students.js";
import authRoutes from "./src/routes/auth.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base Health Check Route
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "College Student Management API is running",
    timestamp: new Date()
  });
});

// Mount Resource Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/collegeDB";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`Backend API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
