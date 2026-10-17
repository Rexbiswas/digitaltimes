const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema(
  {
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: A user can block another user only once
BlockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });
// Fast reverse lookup index to find if A is blocked by B
BlockSchema.index({ blocked: 1, blocker: 1 });

module.exports = mongoose.model("Block", BlockSchema);
