const User = require("../models/User");
const Article = require("../models/Article");
const Bookmark = require("../models/Bookmark");
const ReadingHistory = require("../models/ReadingHistory");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: "30d" });
};

// POST /api/users/auth
const loginOrRegister = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        password: password || "times_default_pass",
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/bookmarks
const getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate("article")
      .sort("-createdAt")
      .lean();

    res.json({
      success: true,
      data: bookmarks,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/bookmarks
const addBookmark = async (req, res, next) => {
  try {
    const { articleId, notes } = req.body;

    const bookmark = await Bookmark.findOneAndUpdate(
      { user: req.user._id, article: articleId },
      { user: req.user._id, article: articleId, notes: notes || "" },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      data: bookmark,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/bookmarks/:articleId
const removeBookmark = async (req, res, next) => {
  try {
    const { articleId } = req.params;

    await Bookmark.findOneAndDelete({
      user: req.user._id,
      article: articleId,
    });

    res.json({
      success: true,
      message: "Clipping removed from saved archives.",
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/history
const getReadingHistory = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const historyDocs = await ReadingHistory.find({ user: req.user._id })
      .populate("article")
      .sort("-readAt")
      .limit(parseInt(limit, 10))
      .lean();

    const formatted = historyDocs.map((item) => {
      const art = item.article || {};
      return {
        _id: item._id,
        id: item.articleCustomId || (art._id ? String(art._id) : String(item._id)),
        articleId: art._id || null,
        headline: item.headline || art.headline || art.title || "Dispatch",
        deck: item.deck || art.deck || art.description || "",
        desk: (item.desk || art.desk || art.category || "BROADSHEET").toUpperCase(),
        author: item.author || art.author || "The Digital Times",
        readTime: item.readTime || art.readTime || "5 MIN READ",
        image: item.image || art.image || null,
        readPercentage: item.readPercentage || 100,
        readDurationSeconds: item.readDurationSeconds || 0,
        readAt: item.readAt || item.updatedAt || item.createdAt,
        article: item.article || null,
      };
    });

    res.json({
      success: true,
      total: formatted.length,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/history
const recordReadingHistory = async (req, res, next) => {
  try {
    const {
      articleId,
      id,
      headline,
      deck,
      desk,
      author,
      readTime,
      image,
      readPercentage = 100,
      readDurationSeconds = 15,
    } = req.body;

    const effectiveId = articleId || id;
    if (!effectiveId && !headline) {
      return res.status(400).json({
        success: false,
        message: "Article ID or headline is required to record reading history.",
      });
    }

    let articleDoc = null;
    if (effectiveId && typeof effectiveId === "string" && effectiveId.match(/^[0-9a-fA-F]{24}$/)) {
      articleDoc = await Article.findById(effectiveId);
    } else if (effectiveId) {
      articleDoc = await Article.findOne({
        $or: [{ slug: effectiveId }, { id: effectiveId }],
      });
    }

    const queryFilters = [{ user: req.user._id }];
    const matchCriteria = [];
    if (articleDoc) {
      matchCriteria.push({ article: articleDoc._id });
    }
    if (effectiveId) {
      matchCriteria.push({ articleCustomId: String(effectiveId) });
    }
    if (headline) {
      matchCriteria.push({ headline: headline.trim() });
    }

    let existing = null;
    if (matchCriteria.length > 0) {
      existing = await ReadingHistory.findOne({
        user: req.user._id,
        $or: matchCriteria,
      });
    }

    let record = null;
    if (existing) {
      existing.readAt = new Date();
      existing.readPercentage = Math.max(existing.readPercentage || 0, Number(readPercentage) || 100);
      existing.readDurationSeconds = (existing.readDurationSeconds || 0) + (Number(readDurationSeconds) || 15);
      if (headline) existing.headline = headline;
      if (deck) existing.deck = deck;
      if (desk) existing.desk = desk;
      if (author) existing.author = author;
      if (readTime) existing.readTime = readTime;
      if (image) existing.image = image;
      if (articleDoc && !existing.article) existing.article = articleDoc._id;
      record = await existing.save();
    } else {
      record = await ReadingHistory.create({
        user: req.user._id,
        article: articleDoc ? articleDoc._id : null,
        articleCustomId: effectiveId ? String(effectiveId) : "",
        headline: headline || (articleDoc ? articleDoc.headline || articleDoc.title : "Dispatch"),
        deck: deck || (articleDoc ? articleDoc.deck || articleDoc.description : ""),
        desk: desk || (articleDoc ? articleDoc.desk : "BROADSHEET"),
        author: author || (articleDoc ? articleDoc.author : "The Digital Times"),
        readTime: readTime || (articleDoc ? articleDoc.readTime : "5 MIN READ"),
        image: image || (articleDoc ? articleDoc.image : null),
        readPercentage: Number(readPercentage) || 100,
        readDurationSeconds: Number(readDurationSeconds) || 15,
        readAt: new Date(),
      });
    }

    // Increment article views
    if (articleDoc) {
      await Article.findByIdAndUpdate(articleDoc._id, { $inc: { views: 1 } });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/history/:articleId
const removeReadingHistoryItem = async (req, res, next) => {
  try {
    const { articleId } = req.params;

    const query = {
      user: req.user._id,
      $or: [
        { _id: articleId.match(/^[0-9a-fA-F]{24}$/) ? articleId : null },
        { article: articleId.match(/^[0-9a-fA-F]{24}$/) ? articleId : null },
        { articleCustomId: articleId },
      ].filter(Boolean),
    };

    await ReadingHistory.findOneAndDelete(query);

    res.json({
      success: true,
      message: "Article removed from reading history.",
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/history
const clearReadingHistory = async (req, res, next) => {
  try {
    await ReadingHistory.deleteMany({ user: req.user._id });

    res.json({
      success: true,
      message: "Reading history cleared successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  loginOrRegister,
  getProfile,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getReadingHistory,
  recordReadingHistory,
  removeReadingHistoryItem,
  clearReadingHistory,
};
