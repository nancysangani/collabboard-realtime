import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, required: true, index: true },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    order: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true },
);

// Create indexes for query optimization
cardSchema.index({ boardId: 1, status: 1, order: 1 });
cardSchema.index({ createdAt: -1 });

export default mongoose.model("Card", cardSchema);
