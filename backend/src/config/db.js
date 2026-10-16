const mongoose = require("mongoose");
const env = require("./env");

let cachedPromise = null;

const connectDB = async () => {
  // 1. If already connected, reuse existing connection (warm serverless instance)
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  // 2. If connection is already in progress, wait for it
  if (cachedPromise) {
    return cachedPromise;
  }

  mongoose.set("strictQuery", false);

  cachedPromise = (async () => {
    try {
      console.log(`[Database] Connecting to MongoDB Atlas (${env.MONGODB_URI ? "URI defined" : "No URI"})...`);
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
      });
      console.log(`[Database] MongoDB connected successfully to: ${mongoose.connection.host}`);
      return true;
    } catch (err) {
      console.warn(`[Database] Atlas connection error: ${err.message}. Attempting fallback...`);
      try {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        await mongoose.connect(uri);
        console.log(`[Database] In-memory MongoDB connected successfully at ${uri}`);
        return true;
      } catch (memErr) {
        console.warn(`[Database] Fallback unavailable: ${memErr.message}. Running in standby mode.`);
        cachedPromise = null;
        return false;
      }
    }
  })();

  return cachedPromise;
};

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cachedPromise = null;
  }
};

module.exports = {
  connectDB,
  isDbConnected,
  closeDB,
};
