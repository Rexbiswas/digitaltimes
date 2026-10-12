const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    headline: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    deck: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
    },
    leadParagraph: {
      type: String,
    },
    bodyParagraphs: {
      type: [String],
      default: [],
    },
    pullQuote: {
      type: String,
    },
    image: {
      type: String,
      default: null,
    },
    urlToImage: {
      type: String,
      default: null,
    },
    imageCaption: {
      type: String,
      default: null,
    },
    imageCredit: {
      type: String,
      default: null,
    },
    video: {
      type: String,
      default: null,
    },
    videoCaption: {
      type: String,
      default: null,
    },
    videoType: {
      type: String,
      default: "embed", // "embed", "mp4", "stream"
    },
    sourceName: {
      type: String,
      default: "The Digital Times Desk",
    },
    sourceUrl: {
      type: String,
      index: true,
    },
    author: {
      type: String,
      default: "By THE EDITORIAL BOARD",
    },
    location: {
      type: String,
      default: "CENTRAL DISPATCH BUREAU",
    },
    category: {
      type: String,
      index: true,
    },
    desk: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      enum: [
        "frontpage",
        "ai",
        "web",
        "startups",
        "design",
        "security",
        "technology",
        "gaming",
        "culture",
        "business",
        "future",
      ],
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    page: {
      type: String,
      default: "PAGE 01",
    },
    readTime: {
      type: String,
      default: "4 MIN READ",
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    discoveredAt: {
      type: Date,
      default: Date.now,
    },
    editionDate: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    breaking: {
      type: Boolean,
      default: false,
      index: true,
    },
    trending: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    saves: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },
    // Deduplication hash generated from normalized title and source
    contentHash: {
      type: String,
      unique: true,
      sparse: true,
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

// Composite text index for full-text search
ArticleSchema.index({
  title: "text",
  headline: "text",
  description: "text",
  deck: "text",
  content: "text",
  leadParagraph: "text",
  tags: "text",
});

// Sync headline with title if not provided
ArticleSchema.pre("validate", function (next) {
  if (!this.headline && this.title) {
    this.headline = this.title;
  }
  if (!this.title && this.headline) {
    this.title = this.headline;
  }
  if (!this.deck && this.description) {
    this.deck = this.description;
  }
  next();
});

module.exports = mongoose.model("Article", ArticleSchema);
