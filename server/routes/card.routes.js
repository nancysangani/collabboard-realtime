import express from "express";
import Card from "../models/Card.js";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../utils/errorHandler.js";
import {
  validateRequest,
  createCardValidation,
  updateCardValidation,
} from "../utils/validators.js";
import logger from "../utils/logger.js";

const router = express.Router();
router.use(protect);

// POST /api/cards
router.post(
  "/",
  createCardValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { title, description, status, boardId, assignee, priority, tags } =
      req.body;
    const count = await Card.countDocuments({ boardId, status });
    const card = await Card.create({
      title,
      description,
      status,
      boardId,
      assignee,
      priority,
      tags,
      order: count,
    });
    const populated = await card.populate("assignee", "name email");
    logger.info(`Card created: ${title} in board ${boardId}`);
    res.status(201).json(populated);
  }),
);

// PATCH /api/cards/:id
router.patch(
  "/:id",
  updateCardValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const card = await Card.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignee", "name email");
    if (!card) throw new AppError("Card not found", 404);
    logger.info(`Card updated: ${req.params.id}`);
    res.json(card);
  }),
);

// DELETE /api/cards/:id — admin or manager
router.delete(
  "/:id",
  authorize("admin", "manager"),
  asyncHandler(async (req, res) => {
    const card = await Card.findByIdAndDelete(req.params.id);
    if (!card) throw new AppError("Card not found", 404);
    logger.info(`Card deleted: ${req.params.id}`);
    res.json({ message: "Card deleted" });
  }),
);

// PATCH /api/cards/reorder — bulk update card orders after drag
router.patch(
  "/reorder/bulk",
  asyncHandler(async (req, res) => {
    const { cards } = req.body; // [{ _id, status, order }]
    if (!Array.isArray(cards))
      throw new AppError("Cards must be an array", 400);

    const ops = cards.map((c) =>
      Card.findByIdAndUpdate(c._id, { status: c.status, order: c.order }),
    );
    await Promise.all(ops);
    logger.info(`Cards reordered: ${cards.length} items`);
    res.json({ message: "Reordered" });
  }),
);

export default router;
