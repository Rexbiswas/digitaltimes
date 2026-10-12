const mongoose = require("mongoose");

const ReadingHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: false,
      index: true,
    },
    articleCustomId: {
      type: String,
      default: "",
    },
    headline: {
      type: String,
      default: "",
    },
    deck: {
      type: String,
      default: "",
    },
    desk: {
      type: String,
      default: "BROADSHEET",
    },
    author: {
      type: String,
      default: "",
    },
    readTime: {
      type: String,
      default: "5 MIN READ",
    },
    image: {
      type: String,
      default: "",
    },
    readPercentage: {
      type: Number,
      default: 100,
    },
    readDurationSeconds: {
      type: Number,
      default: 0,
    },
    readAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ReadingHistory", ReadingHistorySchema);
