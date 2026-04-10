import mongoose from "mongoose";
import { Resolver } from "dns/promises";
import { setServers } from "dns";
import logger from "../utils/logger.js";

setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    logger.info(`✓ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`✗ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
