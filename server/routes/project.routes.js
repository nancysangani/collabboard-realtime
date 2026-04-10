import express from "express";
import Project from "../models/Project.js";
import Board from "../models/Board.js";
import Card from "../models/Card.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";
import { asyncHandler, AppError } from "../utils/errorHandler.js";
import {
  validateRequest,
  createProjectValidation,
  projectIdValidation,
  addMemberValidation,
} from "../utils/validators.js";
import logger from "../utils/logger.js";

const router = express.Router();
router.use(protect);

// GET /api/projects
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate("owner", "name email")
      .populate("members", "name email role");
    res.json(projects);
  }),
);

// POST /api/projects — admin only
router.post(
  "/",
  authorize("admin"),
  createProjectValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { title, description, color } = req.body;
    const project = await Project.create({
      title,
      description,
      color,
      owner: req.user._id,
      members: [req.user._id],
    });
    const board = await Board.create({
      name: "Main Board",
      projectId: project._id,
    });
    logger.info(`Project created: ${title} by ${req.user.email}`);
    res.status(201).json({ project, board });
  }),
);

// GET /api/projects/:id
router.get(
  "/:id",
  projectIdValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email role");
    if (!project) throw new AppError("Project not found", 404);
    const boards = await Board.find({ projectId: project._id });
    res.json({ project, boards });
  }),
);

// POST /api/projects/:id/members — add member by email
router.post(
  "/:id/members",
  authorize("admin", "manager"),
  addMemberValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd)
      throw new AppError(`No user found with email: ${email}`, 404);

    const project = await Project.findById(req.params.id);
    if (!project) throw new AppError("Project not found", 404);

    const alreadyMember = project.members
      .map(String)
      .includes(String(userToAdd._id));
    if (alreadyMember)
      throw new AppError(`${userToAdd.name} is already a member`, 409);

    project.members.push(userToAdd._id);
    await project.save();

    const updated = await Project.findById(req.params.id).populate(
      "members",
      "name email role",
    );
    logger.info(`User ${userToAdd.email} added to project ${req.params.id}`);
    res.json({
      message: `${userToAdd.name} added to project`,
      members: updated.members,
    });
  }),
);

// DELETE /api/projects/:id — admin only
router.delete(
  "/:id",
  authorize("admin"),
  projectIdValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) throw new AppError("Project not found", 404);

    const boards = await Board.find({ projectId: req.params.id });
    for (const b of boards) await Card.deleteMany({ boardId: b._id });
    await Board.deleteMany({ projectId: req.params.id });

    logger.info(`Project deleted: ${project.title}`);
    res.json({ message: "Project deleted" });
  }),
);

// GET /api/projects/:id/boards/:boardId/cards
router.get(
  "/:id/boards/:boardId/cards",
  projectIdValidation,
  validateRequest,
  asyncHandler(async (req, res) => {
    const cards = await Card.find({ boardId: req.params.boardId })
      .populate("assignee", "name email")
      .sort({ order: 1 });
    res.json(cards);
  }),
);

export default router;
