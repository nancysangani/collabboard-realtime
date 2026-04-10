import { body, param, validationResult } from "express-validator";
import { AppError } from "./errorHandler.js";

// Validation error middleware
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((e) => `${e.param}: ${e.msg}`)
      .join(", ");
    return next(new AppError(errorMessages, 400));
  }
  next();
};

// Auth validators
export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number"),
  body("role")
    .optional()
    .isIn(["admin", "manager", "developer"])
    .withMessage("Invalid role"),
];

export const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Project validators
export const createProjectValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Title must be 2-100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be under 500 characters"),
  body("color")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Invalid color format"),
];

export const projectIdValidation = [
  param("id").isMongoId().withMessage("Invalid project ID"),
];

export const addMemberValidation = [
  param("id").isMongoId().withMessage("Invalid project ID"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
];

// Card validators
export const createCardValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 2 })
    .withMessage("Title must be at least 2 characters"),
  body("boardId").isMongoId().withMessage("Invalid board ID"),
  body("columnId").notEmpty().withMessage("Column ID is required"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be under 500 characters"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
];

export const updateCardValidation = [
  param("id").isMongoId().withMessage("Invalid card ID"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Title must be at least 2 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be under 500 characters"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("status").optional().notEmpty().withMessage("Status is required"),
];
