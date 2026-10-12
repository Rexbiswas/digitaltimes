const mongoose = require("mongoose");

const EditionSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      unique: true,
      index: true,
    },
    displayDate: {
      type: String, // e.g. "WEDNESDAY, OCTOBER 7, 2026"
      required: true,
    },
    status: {
      type: String,
      enum: ["live", "archived", "draft"],
      default: "live",
      index: true,
    },
    leadArticle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
    articles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Article",
      },
    ],
    desks: {
      frontpage: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
      ],
      ai: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
      ],
      web: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
      ],
      startups: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
      ],
      design: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
      ],
      security: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
      ],
      technology: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
      ],
      gaming: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
      ],
      culture: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
      ],
      business: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
      ],
      future: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Article",
        },
      ],
    },
    metadata: {
      vol: { type: String, default: "VOL. 01 • NO. 001" },
      circulation: { type: String, default: "1,840,290 BROADSHEETS" },
      weather: {
        type: String,
        default:
          "GLOBAL NETWORK: 24°C / 75°F • BAROMETER 1014 hPa • VISIBILITY OPTIMAL",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Edition", EditionSchema);
