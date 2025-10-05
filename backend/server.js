// backend/server.js

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pkg from 'pg';
const { Pool } = pkg;

// Import routes
import recipeRoutes from './routes/recipeRoutes.js';
import faqRoutes from "./routes/faqRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import mealRoutes from "./routes/mealRoutes.js";
import receiptRoutes from "./routes/recipeRoutes.js"; // Your receipt/scanner routes

dotenv.config();

// Initialize express
const app = express();
app.use(cors());
app.use(express.json());

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ MONGO_URI not found in .env file");
  process.exit(1);
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Neon/PostgreSQL connection
let postgresConnected = false;
let postgresPool = null;

if (process.env.DATABASE_URL) {
  postgresPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  postgresPool.connect()
    .then(client => {
      console.log("✅ Neon/PostgreSQL Connected");
      postgresConnected = true;
      client.release();
    })
    .catch(err => {
      console.log("⚠️  Neon not connected:", err.message);
    });
}

// ========== ICONS ROUTES ==========
app.get("/icons-list", (req, res) => {
  const iconsDir = path.join(__dirname, "../frontend/icons");
  fs.readdir(iconsDir, (err, files) => {
    if (err) return res.status(500).json({ error: "Could not read icons folder" });
    const svgs = files.filter(f => f.endsWith(".svg"));
    res.json(svgs);
  });
});

app.use("/icons", express.static(path.join(__dirname, "../frontend/icons")));

// ========== API STATUS ==========
app.get("/api/status", (req, res) => {
  res.json({
    mongodb: "connected",
    message: "HUNGR API is running"
  });
});

// ========== API ROUTES ==========
app.use("/api/faq", faqRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/receipt", receiptRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// SPA fallback
app.get("*", (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}/api/status`);
});
