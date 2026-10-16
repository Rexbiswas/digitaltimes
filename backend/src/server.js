const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { connectDB, isDbConnected, closeDB } = require("./config/db");
const { initSocket } = require("./config/socket");
const { startCronScheduler } = require("./services/scheduler/scheduler");
const { seedInitialData } = require("./utils/seedData");
const { ensureOfficialAccount } = require("./services/officialAccount");

const httpServer = http.createServer(app);

// Initialize Real-Time WebSockets
const io = initSocket(httpServer);

// Server Lifecycle & Boot
const startServer = async () => {
  try {
    const dbOk = await connectDB();

    if (dbOk && env.AUTO_SEED_FALLBACK) {
      await seedInitialData();
    }

    if (dbOk) {
      await ensureOfficialAccount();
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

// Only start HTTP listener if executed directly (not in Vercel serverless runtime)
if (require.main === module) {
  startServer();
}

module.exports = { app, httpServer, io };
