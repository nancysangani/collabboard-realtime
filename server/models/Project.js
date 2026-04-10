import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    ],
    color: { type: String, default: "#6366f1" },
  },
  { timestamps: true },
);

// Create indexes for query optimization
projectSchema.index({ createdAt: -1 });

export default mongoose.model("Project", projectSchema);
