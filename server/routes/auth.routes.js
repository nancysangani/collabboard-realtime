import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../utils/errorHandler.js";
import {
  validateRequest,
  registerValidation,
  loginValidation,
} from "../utils/validators.js";
import logger from "../utils/logger.js";

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// POST /api/auth/register
router.post(
  "/register",
  registerValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw new AppError("Email already registered", 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || "developer",
    });
    const token = signToken(user._id);

    logger.info(`User registered: ${email}`);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }),
);

// POST /api/auth/login
router.post(
  "/login",
  loginValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      logger.warn(`Failed login attempt: ${email}`);
      throw new AppError("Invalid email or password", 401);
    }

    const token = signToken(user._id);
    logger.info(`User logged in: ${email}`);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }),
);

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;
