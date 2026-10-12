const http = require("http");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const env = require("./config/env");
const { connectDB, isDbConnected, closeDB } = require("./config/db");
const { initSocket } = require("./config/socket");
const errorHandler = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

// Routes
const articleRoutes = require("./routes/articleRoutes");
const editionRoutes = require("./routes/editionRoutes");
const ingestionRoutes = require("./routes/ingestionRoutes");
const searchRoutes = require("./routes/searchRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Controllers for root endpoints
const {
  getTrendingArticles,
  getLiveDispatches,
} = require("./controllers/articleController");

// Broadsheet Scheduler & Seeding
const { startCronScheduler } = require("./services/scheduler/scheduler");
const { seedInitialData } = require("./utils/seedData");

const app = express();
const httpServer = http.createServer(app);

// 1. Security & Core Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: [
      env.FRONTEND_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use("/api", apiLimiter);

// 2. Initialize Real-Time WebSockets
const io = initSocket(httpServer);

// 3. API Routes
// GET /api/health
app.get("/api/health", (req, res) => {
  const connected = isDbConnected();

  if (connected) {
    return res.status(200).json({
      success: true,
      service: "digitaltimes-backend",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } else {
    return res.status(200).json({
      success: false,
      service: "digitaltimes-backend",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// Direct top-level editorial endpoints specified in prompt
app.get("/api/trending", getTrendingArticles);
app.get("/api/newsroom/live", getLiveDispatches);

// API Resource Routers
app.use("/api/articles", articleRoutes);
app.use("/api/editions", editionRoutes);
app.use("/api/ingestion", ingestionRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// Centralized 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found in Digital Times API.`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

// 4. Server Lifecycle & Boot
const startServer = async () => {
  try {
    const dbOk = await connectDB();

    if (dbOk && env.AUTO_SEED_FALLBACK) {
      await seedInitialData();
    }

    // Start background ingestion, midnight broadsheet rollover, and trending scheduler
    if (dbOk) {
      startCronScheduler();
    }

    httpServer.listen(env.PORT, () => {
      console.log(`=======================================================`);
      console.log(` THE DIGITAL TIMES — BACKEND SERVICE IS OPERATIONAL`);
      console.log(` Mode:        ${env.NODE_ENV}`);
      console.log(` Port:        http://localhost:${env.PORT}`);
      console.log(` Health:      http://localhost:${env.PORT}/api/health`);
      console.log(` Database:    ${isDbConnected() ? "CONNECTED" : "STANDBY/OFFLINE"}`);
      console.log(` Real-time:   Socket.IO Active`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error("[Server] Fatal startup error:", err);
    process.exit(1);
  }
};

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Closing HTTP and Database connections...`);
  httpServer.close(async () => {
    await closeDB();
    console.log("[Server] Gracefully terminated.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

startServer();

module.exports = { app, httpServer };
