const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const env = require("./config/env");
const { connectDB, isDbConnected } = require("./config/db");
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
const followRoutes = require("./routes/followRoutes");
const feedRoutes = require("./routes/feedRoutes");
const verificationRoutes = require("./routes/verificationRoutes");

// Controllers for root endpoints
const {
  getTrendingArticles,
  getLiveDispatches,
} = require("./controllers/articleController");
const {
  getJournalists,
  getJournalistFollowers,
  getDeskFollowers,
} = require("./controllers/followController");

const app = express();

// 1. Security & Core Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use("/api", apiLimiter);

// 2. Serverless Database Connection Assurance
app.use(async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      await connectDB();
    }
  } catch (err) {
    console.error("[Database] Serverless connection error:", err);
  }
  next();
});

// 3. API Routes
app.get("/", (req, res) => {
  res.status(200).json({
    service: "The Digital Times Editorial API",
    status: "online",
    health: "/api/health"
  });
});

// GET /api/health & /health
app.get(["/api/health", "/health"], (req, res) => {
  const connected = isDbConnected();
  res.status(200).json({
    success: connected,
    service: "digitaltimes-backend",
    environment: env.NODE_ENV,
    database: connected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Root editorial endpoints
app.get(["/api/trending", "/trending"], getTrendingArticles);
app.get(["/api/newsroom/live", "/newsroom/live"], getLiveDispatches);

// API Resource Routers (Mounted with and without /api prefix for robust serverless/proxy support)
app.use(["/api/articles", "/articles"], articleRoutes);
app.use(["/api/editions", "/editions"], editionRoutes);
app.use(["/api/ingestion", "/ingestion"], ingestionRoutes);
app.use(["/api/search", "/search"], searchRoutes);
app.use(["/api/users", "/users"], userRoutes);
app.use(["/api/notifications", "/notifications"], notificationRoutes);
app.use(["/api/admin", "/admin"], adminRoutes);

// Social, Feed & Profile Verification Routers
app.get(["/api/journalists", "/journalists"], getJournalists);
app.get(["/api/journalists/:id/followers", "/journalists/:id/followers"], getJournalistFollowers);
app.get(["/api/desks/:id/followers", "/desks/:id/followers"], getDeskFollowers);
app.use(["/api/follows", "/follows"], followRoutes);
app.use(["/api/feed", "/feed"], feedRoutes);
app.use(["/api/verification", "/verification"], verificationRoutes);

// Centralized 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found in Digital Times API.`,
  });
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
