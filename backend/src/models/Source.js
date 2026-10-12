const mongoose = require("mongoose");

const SourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["NewsAPI", "RSS", "Custom"],
      default: "RSS",
      required: true,
    },
    category: {
      type: String,
      default: "technology",
    },
    defaultDesk: {
      type: String,
      default: "technology",
    },
    logo: {
      type: String,
      default: null,
    },
    active: {
      type: Boolean,
      default: true,
    },
    fetchIntervalMinutes: {
      type: Number,
      default: 30,
    },
    lastFetchedAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Source", SourceSchema);
