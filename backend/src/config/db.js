const mongoose = require("mongoose");
const env = require("./env");

let isConnected = false;

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    console.log(`[Database] Attempting connection to MongoDB at: ${env.MONGODB_URI}...`);
    
    // Connect with a 2-second timeout to prevent hanging on boot
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });

    isConnected = true;
    console.log(`[Database] MongoDB connected successfully to: ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`[Database] Local MongoDB unavailable (${err.message}). Attempting in-memory MongoDB fallback...`);
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      isConnected = true;
      console.log(`[Database] In-memory MongoDB connected successfully at ${uri}`);
      return true;
    } catch (memErr) {
      isConnected = false;
      console.warn(`[Database] In-memory DB unavailable (${memErr.message}). Starting backend in standby/fallback mode.`);
      return false;
    }
  }
};

const isDbConnected = () => {
  return isConnected && mongoose.connection.readyState === 1;
};

const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
  if (typeof mongod !== "undefined" && mongod) {
    await mongod.stop();
  }
};

module.exports = {
  connectDB,
  isDbConnected,
  closeDB,
};
