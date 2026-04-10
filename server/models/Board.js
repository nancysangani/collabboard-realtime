import mongoose from "mongoose";

const boardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    columns: {
      type: [String],
      default: ["Todo", "In Progress", "Review", "Done"],
    },
  },
  { timestamps: true },
);

// Create indexes for query optimization
boardSchema.index({ createdAt: -1 });

export default mongoose.model("Board", boardSchema);
