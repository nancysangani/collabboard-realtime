import mongoose from "mongoose";
import { Resolver } from "dns/promises";
import { setServers } from "dns";
import logger from "../utils/logger.js";

setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      const msg = "MONGO_URI environment variable is not defined";
      console.error("❌", msg);
      throw new Error(msg);
    }

    console.log("🔄 Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`✓ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    logger.error(`✗ MongoDB connection error: ${error.message}`);
    throw error;
  }
};

export default connectDB;
