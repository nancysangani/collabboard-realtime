import Card from "../models/Card.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../utils/logger.js";

// Middleware to verify socket token
export const verifySocketToken = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    next();
  } catch (err) {
    logger.warn(`Socket auth failed: ${err.message}`);
    next(new Error("Token invalid or expired"));
  }
};

export const registerBoardSocket = (io, socket) => {
  // Join a board room to receive real-time updates
  socket.on("board:join", ({ boardId }) => {
    if (!socket.user) {
      socket.emit("error", { message: "Not authenticated" });
      return;
    }

    socket.join(boardId);
    socket.data.boardId = boardId;

    // Notify others in the room
    socket.to(boardId).emit("user:joined", {
      user: {
        id: socket.user._id,
        name: socket.user.name,
        email: socket.user.email,
      },
      boardId,
    });
    logger.info(`${socket.user.name} joined board ${boardId}`);
  });

  // Card moved to a different column (drag & drop)
  socket.on("card:move", async ({ boardId, cardId, status, order }) => {
    try {
      if (!socket.user) {
        socket.emit("error", { message: "Not authenticated" });
        return;
      }

      await Card.findByIdAndUpdate(cardId, { status, order });
      // Broadcast to all OTHER clients in this board room
      socket.to(boardId).emit("card:moved", { cardId, status, order });
      logger.debug(`Card moved: ${cardId} to status ${status}`);
    } catch (err) {
      logger.error(`Card move error: ${err.message}`);
      socket.emit("error", { message: err.message });
    }
  });

  // Card content updated (title, description, assignee, priority)
  socket.on("card:update", async ({ boardId, cardId, updates }) => {
    try {
      if (!socket.user) {
        socket.emit("error", { message: "Not authenticated" });
        return;
      }

      const card = await Card.findByIdAndUpdate(cardId, updates, {
        new: true,
      }).populate("assignee", "name email");
      socket.to(boardId).emit("card:updated", card);
      logger.debug(`Card updated: ${cardId}`);
    } catch (err) {
      logger.error(`Card update error: ${err.message}`);
      socket.emit("error", { message: err.message });
    }
  });

  // New card created
  socket.on("card:created", ({ boardId, card }) => {
    if (!socket.user) {
      socket.emit("error", { message: "Not authenticated" });
      return;
    }
    socket.to(boardId).emit("card:created", card);
  });

  // Card deleted
  socket.on("card:deleted", ({ boardId, cardId }) => {
    if (!socket.user) {
      socket.emit("error", { message: "Not authenticated" });
      return;
    }
    socket.to(boardId).emit("card:deleted", { cardId });
  });

  // Bulk reorder after drag
  socket.on("cards:reordered", ({ boardId, cards }) => {
    if (!socket.user) {
      socket.emit("error", { message: "Not authenticated" });
      return;
    }
    socket.to(boardId).emit("cards:reordered", { cards });
  });

  socket.on("board:leave", ({ boardId }) => {
    socket.leave(boardId);
    if (socket.user) {
      socket.to(boardId).emit("user:left", {
        user: { id: socket.user._id, name: socket.user.name },
      });
    }
  });

  socket.on("disconnect", () => {
    if (socket.data.boardId && socket.user) {
      socket.to(socket.data.boardId).emit("user:left", {
        user: { id: socket.user._id, name: socket.user.name },
      });
      logger.info(`${socket.user.name} left board ${socket.data.boardId}`);
    }
  });

  socket.on("error", (error) => {
    logger.error(`Socket error: ${error.message}`);
  });
};
