const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    // The user receiving the notification (null for global broadcast)
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    // Backward-compatible alias for recipient
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    // The user who initiated the action
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    // Related entity (e.g. Follow relationship)
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Follow",
      index: true,
      default: null,
    },
    title: {
      type: String,
      default: "Broadsheet Dispatch",
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "NEW_FOLLOWER",
        "follow",
        "breaking",
        "edition",
        "system",
        "desk",
        "history",
        "clipping",
        "author",
        "verification",
      ],
      default: "breaking",
      index: true,
    },
    desk: {
      type: String,
      default: "NEWSROOM",
    },
    time: {
      type: String,
      default: "JUST NOW",
    },
    link: {
      type: String,
      default: "",
    },
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
    articleCustomId: {
      type: String,
      default: "",
    },
    story: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
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

// Pre-save hook to synchronize recipient <-> user and isRead <-> read
NotificationSchema.pre("save", function (next) {
  if (this.recipient && !this.user) {
    this.user = this.recipient;
  } else if (this.user && !this.recipient) {
    this.recipient = this.user;
  }

  if (this.isRead !== undefined && this.read !== this.isRead) {
    this.read = this.isRead;
  } else if (this.read !== undefined && this.isRead !== this.read) {
    this.isRead = this.read;
  }
  next();
});

// Compound indexes for high-performance chronological queries & unread filtering
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);

