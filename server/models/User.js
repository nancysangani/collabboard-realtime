import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "developer"],
      default: "developer",
      index: true,
    },
    avatar: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
