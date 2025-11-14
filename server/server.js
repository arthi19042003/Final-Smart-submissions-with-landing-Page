// server/server.js
// ===============================================
// Smart Submissions Server
// ===============================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose"); // ✅ Added mongoose import
const connectDB = require("./config/db");

// ===============================================
// Initialize App
// ===============================================
const app = express();

// ===============================================
// Middleware
// ===============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===============================================
// MongoDB Connection & Auto-Fix for PO Error
// ===============================================
connectDB()
  .then(async () => {
    console.log("✅ MongoDB Connected Successfully");

    // 🛠️ AUTO-FIX: Remove the old 'poId' rule that is blocking you
    try {
      const collection = mongoose.connection.collection("purchaseorders");
      const indexes = await collection.indexes();
      const indexExists = indexes.some((idx) => idx.name === "poId_1");

      if (indexExists) {
        console.log("⚠️ Found conflicting index 'poId_1'. Dropping it...");
        await collection.dropIndex("poId_1");
        console.log("✅ Index 'poId_1' dropped. You can now create POs!");
      }
    } catch (err) {
      // Ignore errors if collection/index doesn't exist yet
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  });

// ===============================================
// Import Middleware
// ===============================================
const protect = require("./middleware/auth");

// ===============================================
// Public Routes
// ===============================================
app.use("/api/auth", require("./routes/auth"));

// ===============================================
// Candidate Routes
// ===============================================
app.use("/api/profile", require("./routes/profile"));
app.use("/api/resume", require("./routes/resume"));

// ===============================================
// Employer Routes
// ===============================================
app.use("/api/employer", require("./routes/employerRoutes"));

// ===============================================
// Hiring Manager Routes (Integrated from New HR)
// ===============================================
app.use("/api/hiring-dashboard", protect, require("./routes/hiringDashboard"));
app.use("/api/positions", protect, require("./routes/positions"));
app.use("/api/purchase-orders", protect, require("./routes/purchaseOrders"));
app.use("/api/applications", protect, require("./routes/applications"));
app.use("/api/onboarding", protect, require("./routes/onboarding"));
app.use("/api/agencies", protect, require("./routes/agencies"));

// ===============================================
// Recruiter Routes (Protected)
// ===============================================
app.use("/api/recruiter", protect, require("./routes/recruiter"));

// ===============================================
// Shared / Other Protected Routes
// ===============================================
app.use("/api/inbox", protect, require("./routes/inbox"));
app.use("/api/candidates", protect, require("./routes/candidates"));
app.use("/api/interviews", protect, require("./routes/interviewRoutes"));
app.use("/api/dashboard", protect, require("./routes/dashboard"));
app.use("/api/submissions", protect, require("./routes/submissions"));


// ===============================================
// Health Check Route
// ===============================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "🚀 Smart Submissions API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ===============================================
// 404 Handler
// ===============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ===============================================
// Global Error Handler
// ===============================================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ===============================================
// Start Server
// ===============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Smart Submissions Server running on port ${PORT}`);
});