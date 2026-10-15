const mongoose = require("mongoose");

const VerificationRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["journalist", "editor", "publication"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    organization: {
      type: String,
      required: true,
      trim: true,
    },
    titleOrRole: {
      type: String,
      trim: true,
      default: "",
    },
    workLinks: {
      type: [String],
      default: [],
    },
    evidence: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewerNotes: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

VerificationRequestSchema.index({ user: 1, status: 1 });
VerificationRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("VerificationRequest", VerificationRequestSchema);
