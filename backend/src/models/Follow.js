const mongoose = require("mongoose");

const FollowSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ["user", "journalist", "desk"],
      required: true,
      index: true,
    },
    // targetId can be a User ObjectId string, author string, or desk slug
    targetId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    followedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    targetName: {
      type: String,
      required: true,
      trim: true,
    },
    targetDesk: {
      type: String,
      trim: true,
      default: "",
    },
    targetAvatar: {
      type: String,
      default: null,
    },
    targetVerified: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: a user can only follow a specific user, journalist, or desk once
FollowSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
// Fast lookup index for counting followers
FollowSchema.index({ targetType: 1, targetId: 1 });
// Fast lookup index for user's following list
FollowSchema.index({ user: 1, targetType: 1 });

module.exports = mongoose.model("Follow", FollowSchema);
