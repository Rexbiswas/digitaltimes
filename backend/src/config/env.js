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
  // Email / SMTP settings
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  EMAIL_USER: process.env.EMAIL_USER || process.env.SMTP_USER || "",
  EMAIL_PASS: process.env.EMAIL_PASS || process.env.SMTP_PASS || "",
  EMAIL_FROM: process.env.EMAIL_FROM || '"The Digital Times" <no-reply@digitaltimes.com>',
};
