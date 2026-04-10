import logger from "./logger.js";

// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  logger.error(
    `[${req.method}] ${req.path} >> Status: ${status}, Message: ${message}`,
  );

  res.status(status).json({
    success: false,
    status,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

// Async handler wrapper to avoid try-catch blocks
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
    this.timestamp = new Date().toISOString();
  }
}
