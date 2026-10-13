const User = require("../models/User");
const Article = require("../models/Article");
const Bookmark = require("../models/Bookmark");
const ReadingHistory = require("../models/ReadingHistory");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { sendPasswordResetEmail } = require("../services/emailService");

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: "30d" });
};

// Password regex: minimum 8 characters, at least one uppercase letter, one lowercase letter, and one number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#^~_.\-+=[\]{}()]{8,}$/;

// POST /api/users/auth
const loginOrRegister = async (req, res, next) => {
  try {
    const { email, name, password, action = "login", topics } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid telegraph email address format.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail }).select("+password");

    // ─────────────────────────────────────────────────────────────
    // 0. GOOGLE DISPATCH AUTHENTICATION (Press Pass SSO)
    // ─────────────────────────────────────────────────────────────
    if (action === "google") {
      let user = existingUser;
      if (!user) {
        user = await User.create({
          name: (name && name.trim()) || cleanEmail.split("@")[0] || "Google Reader",
          email: cleanEmail,
          role: "reader",
          preferences: {
            favoriteDesks: Array.isArray(topics) && topics.length > 0 ? topics : ["ai", "web", "startups"],
            theme: "morning",
          },
        });
      }

      const token = generateToken(user._id);

      return res.json({
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
    }

    // ─────────────────────────────────────────────────────────────
    // 1. SIGNUP / REGISTRATION FLOW (For new users)
    // ─────────────────────────────────────────────────────────────
    if (action === "signup") {
      if (existingUser) {
        return res.status(409).json({
          success: false,
          code: "USER_ALREADY_EXISTS",
          message: "A reader profile with this email already exists. Please sign in instead.",
        });
      }

      if (!password || password.length < 8) {
        return res.status(400).json({
          success: false,
          code: "PASSWORD_TOO_SHORT",
          message: "Cipher passcode must contain at least 8 characters.",
        });
      }

      if (!PASSWORD_REGEX.test(password)) {
        return res.status(400).json({
          success: false,
          code: "PASSWORD_INVALID_REGEX",
          message: "Passcode must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number.",
        });
      }

      const newUser = await User.create({
        name: (name && name.trim()) || cleanEmail.split("@")[0],
        email: cleanEmail,
        password: password,
        preferences: {
          favoriteDesks: Array.isArray(topics) && topics.length > 0 ? topics : ["ai", "web", "startups"],
        },
      });

      const token = generateToken(newUser._id);

      return res.status(201).json({
        success: true,
        message: "Reader profile enrolled successfully.",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          preferences: newUser.preferences,
        },
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 3. FORGOT / RESET PASSCODE ACTIONS
    // ─────────────────────────────────────────────────────────────
    if (action === "forgot-password") {
      return forgotPassword(req, res, next);
    }
    if (action === "verify-reset-code") {
      return verifyResetCode(req, res, next);
    }
    if (action === "reset-password") {
      return resetPassword(req, res, next);
    }

    // ─────────────────────────────────────────────────────────────
    // 2. SIGNIN / LOGIN FLOW (For existing users)
    // ─────────────────────────────────────────────────────────────
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "No subscriber profile found with this telegraph email. Please sign up first.",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Cipher passcode is required to sign in.",
      });
    }

    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid cipher passcode. Please check your credentials and try again.",
      });
    }

    const token = generateToken(existingUser._id);

    return res.json({
      success: true,
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        preferences: existingUser.preferences,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Telegraph email address is required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "No subscriber profile found with this telegraph email. Please check your address or sign up.",
      });
    }

    // Generate 6-digit cryptographic recovery code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.resetCode = resetCode;
    user.resetCodeExpires = expiresAt;
    await user.save();

    // Dispatch recovery code to the subscriber's email address
    await sendPasswordResetEmail(cleanEmail, resetCode, user.name);

    return res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your email inbox and enter the code below.`,
      email: cleanEmail,
      expiresInMinutes: 15,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/verify-reset-code
const verifyResetCode = async (req, res, next) => {
  try {
    const { email, resetCode } = req.body;

    if (!email || !resetCode) {
      return res.status(400).json({
        success: false,
        message: "Telegraph email address and 6-digit recovery cipher code are required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select("+resetCode +resetCodeExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "No subscriber profile found with this telegraph email.",
      });
    }

    if (!user.resetCode || user.resetCode !== String(resetCode).trim()) {
      return res.status(400).json({
        success: false,
        code: "INVALID_RESET_CODE",
        message: "Invalid recovery cipher code. Please check the 6-digit code provided.",
      });
    }

    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      return res.status(400).json({
        success: false,
        code: "EXPIRED_RESET_CODE",
        message: "Recovery cipher code has expired. Please request a fresh transmission.",
      });
    }

    return res.json({
      success: true,
      message: "Recovery cipher verified successfully. You may now create a new passcode.",
      email: cleanEmail,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, recovery code, and new cipher passcode are all required.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail }).select("+resetCode +resetCodeExpires +password");

    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "No subscriber profile found with this telegraph email.",
      });
    }

    if (!user.resetCode || user.resetCode !== String(resetCode).trim()) {
      return res.status(400).json({
        success: false,
        code: "INVALID_RESET_CODE",
        message: "Invalid recovery cipher code. Please check the 6-digit code provided.",
      });
    }

    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      return res.status(400).json({
        success: false,
        code: "EXPIRED_RESET_CODE",
        message: "Recovery cipher code has expired. Please request a fresh transmission.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        code: "PASSWORD_TOO_SHORT",
        message: "New cipher passcode must contain at least 8 characters.",
      });
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        code: "PASSWORD_INVALID_REGEX",
        message: "Passcode must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number.",
      });
    }

    user.password = newPassword;
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Cipher passcode successfully reset in subscriber registry. You may now sign in with your new passcode.",
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
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getProfile,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getReadingHistory,
  recordReadingHistory,
  removeReadingHistoryItem,
  clearReadingHistory,
};
