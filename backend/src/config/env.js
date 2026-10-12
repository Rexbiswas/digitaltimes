const dotenv = require("dotenv");
const path = require("path");

// Load .env from backend folder or root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

module.exports = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/digitaltimes",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  NEWS_API_KEY: process.env.NEWS_API_KEY || "",
  JWT_SECRET: process.env.JWT_SECRET || "digitaltimes_jwt_secret_dev_key_2026",
  AUTO_SEED_FALLBACK: process.env.AUTO_SEED_FALLBACK !== "false",
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || "",
};
