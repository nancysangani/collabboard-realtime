import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import cardRoutes from "./routes/card.routes.js";
import {
  registerBoardSocket,
  verifySocketToken,
} from "./socket/boardSocket.js";
import { errorHandler } from "./utils/errorHandler.js";
import logger from "./utils/logger.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// Socket authentication middleware
io.use(verifySocketToken);

// Security middleware
app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth attempts per windowMs
  message: "Too many login attempts, please try again later",
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/cards", cardRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// Serve React build (production)
const clientBuildPath = path.join(__dirname, "../client/dist");
const isProduction = process.env.NODE_ENV === "production";

logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
logger.info(`Serving static files from: ${clientBuildPath}`);
logger.info(`Is Production: ${isProduction}`);

if (isProduction) {
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, "index.html"));
  });
} else {
  logger.info("Not in production mode - not serving React app");
}

// Socket.io
io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  registerBoardSocket(io, socket);

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
(async () => {
  process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  });

  try {
    console.log("🔄 Starting server...");
    await connectDB();
    console.log("✅ Database connected successfully!");
  } catch (error) {
    console.error("⚠️ Database connection failed:", error.message);
    console.log("⚠️ Server will continue without database...");
  }

  httpServer.listen(PORT, () => {
    const url = process.env.CLIENT_URL || `http://localhost:${PORT}`;

    console.log("\n🚀 CollabBoard Server Started...");
    console.log(`🌐 App running at: ${url}`);
    console.log(`📡 API available at: ${url}/api`);
    console.log(`🔌 Socket.IO ready`);
    console.log(`⚙️ Environment: ${process.env.NODE_ENV || "development"}`);
    console.log("=====================================\n");
  });
})();
