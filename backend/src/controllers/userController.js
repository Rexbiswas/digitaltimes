const User = require("../models/User");
const Article = require("../models/Article");
const Bookmark = require("../models/Bookmark");
const ReadingHistory = require("../models/ReadingHistory");
const Follow = require("../models/Follow");
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
    // ─────────────────────────────────────────────────────────────
    // 0. GOOGLE DISPATCH AUTHENTICATION (Press Pass SSO)
    // ─────────────────────────────────────────────────────────────
    if (action === "google") {
      let user = existingUser;
      const avatarUrl = req.body.avatar || null;
      if (!user) {
        const generatedUsername = await User.generateUniqueUsername(
          (name && name.trim()) || cleanEmail.split("@")[0]
        );
        user = await User.create({
          name: (name && name.trim()) || cleanEmail.split("@")[0] || "Google Reader",
          username: generatedUsername,
          email: cleanEmail,
          avatar: avatarUrl,
          role: "reader",
          accountType: "reader",
          isVerified: false,
          preferences: {
            favoriteDesks: Array.isArray(topics) && topics.length > 0 ? topics : ["ai", "web", "startups"],
            theme: "morning",
          },
        });
      } else if (avatarUrl && !user.avatar) {
        user.avatar = avatarUrl;
        await user.save();
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          accountType: user.accountType || "reader",
          isVerified: !!user.isVerified,
          avatar: user.avatar,
          bio: user.bio,
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

      let chosenUsername = "";
      if (req.body.username && typeof req.body.username === "string" && req.body.username.trim()) {
        chosenUsername = req.body.username.trim().toLowerCase();
        if (!/^[a-z0-9_.]{3,30}$/.test(chosenUsername)) {
          return res.status(400).json({
            success: false,
            code: "INVALID_USERNAME_FORMAT",
            message: "Username must be 3-30 characters and contain only lowercase letters, numbers, underscores, and periods.",
          });
        }
        if (User.isUsernameReserved(chosenUsername)) {
          return res.status(400).json({
            success: false,
            code: "RESERVED_USERNAME",
            message: "This username is reserved for official Digital Times broadsheet operations.",
          });
        }
        const existingUsername = await User.findOne({ username: chosenUsername });
        if (existingUsername) {
          return res.status(409).json({
            success: false,
            code: "USERNAME_TAKEN",
            message: "This broadsheet username is already claimed by another subscriber.",
          });
        }
      } else {
        chosenUsername = await User.generateUniqueUsername((name && name.trim()) || cleanEmail.split("@")[0]);
      }

      const newUser = await User.create({
        name: (name && name.trim()) || cleanEmail.split("@")[0],
        username: chosenUsername,
        email: cleanEmail,
        password: password,
        role: "reader",
        accountType: "reader",
        isVerified: false,
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
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          accountType: newUser.accountType || "reader",
          isVerified: !!newUser.isVerified,
          avatar: newUser.avatar,
          bio: newUser.bio,
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

    // Ensure user has a username if legacy
    if (!existingUser.username) {
      existingUser.username = await User.generateUniqueUsername(existingUser.name || existingUser.email.split("@")[0]);
      await existingUser.save();
    }

    const token = generateToken(existingUser._id);

    return res.json({
      success: true,
      token,
      user: {
        id: existingUser._id,
        name: existingUser.name,
        username: existingUser.username,
        email: existingUser.email,
        role: existingUser.role,
        accountType: existingUser.accountType || "reader",
        isVerified: !!existingUser.isVerified,
        avatar: existingUser.avatar,
        bio: existingUser.bio,
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
    if (!user) {
      return res.status(404).json({ success: false, message: "User profile not found." });
    }

    const Notification = require("../models/Notification");
    const targetIdStr = user._id.toString();

    const [
      followerCount,
      followingCount,
      deskSubscriptionsCount,
      savedClippingsCount,
      readingHistoryCount,
      unreadNotificationsCount,
      followedDesks,
    ] = await Promise.all([
      Follow.countDocuments({
        targetType: "user",
        $or: [{ targetId: targetIdStr }, { followedUser: user._id }],
      }),
      Follow.countDocuments({
        user: user._id,
        targetType: "user",
      }),
      Follow.countDocuments({
        user: user._id,
        targetType: "desk",
      }),
      Bookmark.countDocuments({ user: user._id }),
      ReadingHistory.countDocuments({ user: user._id }),
      Notification.countDocuments({ recipient: user._id, unread: true }),
      Follow.find({ user: user._id, targetType: "desk" })
        .select("targetId targetName targetDesk createdAt")
        .lean(),
    ]);

    const userObj = user.toObject();

    res.json({
      success: true,
      user: {
        ...userObj,
        id: user._id,
        followerCount,
        followingCount,
        deskSubscriptionsCount,
        savedClippingsCount,
        readingHistoryCount,
        unreadNotificationsCount,
        deskSubscriptions: followedDesks.map((d) => ({
          id: d.targetId,
          name: d.targetName,
          desk: d.targetDesk,
          createdAt: d.createdAt,
        })),
        subscription: userObj.subscription || {
          plan: "Annual Broadsheet",
          status: "active",
          renewsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, preferences } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (name && typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }
    if (typeof bio === "string") {
      user.bio = bio.slice(0, 300);
    }
    if (avatar !== undefined) {
      user.avatar = avatar;
    }
    if (preferences && typeof preferences === "object") {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        isVerified: !!user.isVerified,
        avatar: user.avatar,
        bio: user.bio,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/discover
// Discover real registered users with search, pagination, authoritative follower counts, and isFollowing status
const discoverUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));

    // Optional auth extraction from Bearer token
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], env.JWT_SECRET);
        currentUserId = decoded.id;
      } catch (e) {}
    }

    const filter = {};
    if (currentUserId) {
      filter._id = { $ne: currentUserId };
    }

    if (q && typeof q === "string" && q.trim()) {
      const cleanQ = q.trim().replace(/^@/, "");
      filter.$or = [
        { username: { $regex: cleanQ, $options: "i" } },
        { name: { $regex: cleanQ, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);

    // Prioritize official brand accounts first, then verified, then newest
    const users = await User.find(filter)
      .select("name username avatar bio organization desk accountType isVerified verification createdAt")
      .sort({ accountType: -1, isVerified: -1, createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Enrich each user with live authoritative follower & following counts and isFollowing flag
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const uIdStr = u._id.toString();
        const followerCount = await Follow.countDocuments({
          targetType: "user",
          targetId: uIdStr,
        });
        const followingCount = await Follow.countDocuments({
          user: u._id,
          targetType: "user",
        });

        let isFollowing = false;
        if (currentUserId) {
          isFollowing = !!(await Follow.exists({
            user: currentUserId,
            targetType: "user",
            targetId: uIdStr,
          }));
        }

        return {
          id: u._id,
          _id: u._id,
          name: u.name,
          username: u.username,
          avatar: u.avatar || null,
          bio: u.bio || "",
          organization: u.organization || "",
          desk: u.desk || "",
          accountType: u.accountType || "reader",
          isVerified: !!u.isVerified,
          verification: u.verification || { status: "unverified" },
          followerCount,
          followingCount,
          isFollowing,
          createdAt: u.createdAt,
        };
      })
    );

    res.json({
      success: true,
      data: enrichedUsers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/profile/:usernameOrId
// Retrieve public broadsheet profile for any registered user
const getUserProfile = async (req, res, next) => {
  try {
    const { usernameOrId } = req.params;
    if (!usernameOrId || !usernameOrId.trim()) {
      return res.status(400).json({ success: false, message: "Username or user ID is required." });
    }

    const clean = usernameOrId.trim().replace(/^@/, "").toLowerCase();

    let user = null;
    if (clean.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(clean)
        .select("name username avatar bio organization desk accountType isVerified verification createdAt")
        .lean();
    }
    if (!user) {
      user = await User.findOne({ username: clean })
        .select("name username avatar bio organization desk accountType isVerified verification createdAt")
        .lean();
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        code: "USER_NOT_FOUND",
        message: "No subscriber profile found with this username or telegraph identifier.",
      });
    }

    // Optional auth extraction
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], env.JWT_SECRET);
        currentUserId = decoded.id;
      } catch (e) {}
    }

    const uIdStr = user._id.toString();
    const followerCount = await Follow.countDocuments({
      targetType: "user",
      targetId: uIdStr,
    });
    const followingCount = await Follow.countDocuments({
      user: user._id,
      targetType: "user",
    });

    let isFollowing = false;
    if (currentUserId) {
      isFollowing = !!(await Follow.exists({
        user: currentUserId,
        targetType: "user",
        targetId: uIdStr,
      }));
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar || null,
        bio: user.bio || "",
        organization: user.organization || "",
        desk: user.desk || "",
        accountType: user.accountType || "reader",
        isVerified: !!user.isVerified,
        verification: user.verification || { status: "unverified" },
        followerCount,
        followingCount,
        isFollowing,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/followers
const getUserFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    let targetUser = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      targetUser = await User.findById(id).select("_id name username");
    }
    if (!targetUser) {
      targetUser = await User.findOne({ username: id.toLowerCase().replace(/^@/, "") }).select("_id name username");
    }
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Subscriber account not found." });
    }

    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], env.JWT_SECRET);
        currentUserId = decoded.id;
      } catch (e) {}
    }

    const follows = await Follow.find({
      targetType: "user",
      targetId: targetUser._id.toString(),
    })
      .populate("user", "name username avatar bio accountType isVerified verification")
      .sort("-createdAt")
      .lean();

    const followers = await Promise.all(
      follows.map(async (f) => {
        if (!f.user) return null;
        let isFollowing = false;
        if (currentUserId) {
          isFollowing = !!(await Follow.exists({
            user: currentUserId,
            targetType: "user",
            targetId: f.user._id.toString(),
          }));
        }
        return {
          id: f.user._id,
          _id: f.user._id,
          name: f.user.name,
          username: f.user.username,
          avatar: f.user.avatar || null,
          bio: f.user.bio || "",
          accountType: f.user.accountType || "reader",
          isVerified: !!f.user.isVerified,
          isFollowing,
          followedAt: f.createdAt,
        };
      })
    );

    res.json({
      success: true,
      targetUser: {
        id: targetUser._id,
        name: targetUser.name,
        username: targetUser.username,
      },
      count: followers.filter(Boolean).length,
      data: followers.filter(Boolean),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:id/following
const getUserFollowing = async (req, res, next) => {
  try {
    const { id } = req.params;
    let targetUser = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      targetUser = await User.findById(id).select("_id name username");
    }
    if (!targetUser) {
      targetUser = await User.findOne({ username: id.toLowerCase().replace(/^@/, "") }).select("_id name username");
    }
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Subscriber account not found." });
    }

    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], env.JWT_SECRET);
        currentUserId = decoded.id;
      } catch (e) {}
    }

    const follows = await Follow.find({
      user: targetUser._id,
      targetType: "user",
    })
      .sort("-createdAt")
      .lean();

    const userIds = follows
      .map((f) => f.targetId)
      .filter((tid) => tid.match(/^[0-9a-fA-F]{24}$/));

    const followedUsers = await User.find({ _id: { $in: userIds } })
      .select("name username avatar bio accountType isVerified verification")
      .lean();

    const usersMap = new Map(followedUsers.map((u) => [u._id.toString(), u]));

    const enrichedFollowing = await Promise.all(
      follows.map(async (f) => {
        const u = usersMap.get(f.targetId);
        if (!u) return null;
        let isFollowing = false;
        if (currentUserId) {
          isFollowing = !!(await Follow.exists({
            user: currentUserId,
            targetType: "user",
            targetId: u._id.toString(),
          }));
        }
        return {
          id: u._id,
          _id: u._id,
          name: u.name,
          username: u.username,
          avatar: u.avatar || null,
          bio: u.bio || "",
          accountType: u.accountType || "reader",
          isVerified: !!u.isVerified,
          isFollowing,
          followedAt: f.createdAt,
        };
      })
    );

    res.json({
      success: true,
      targetUser: {
        id: targetUser._id,
        name: targetUser.name,
        username: targetUser.username,
      },
      count: enrichedFollowing.filter(Boolean).length,
      data: enrichedFollowing.filter(Boolean),
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

// DELETE /api/users/:id
// Delete a subscriber account and cascade related records
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    let targetUser = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      targetUser = await User.findById(id);
    }
    if (!targetUser) {
      targetUser = await User.findOne({ username: id.toLowerCase().replace(/^@/, "") });
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Subscriber account not found." });
    }

    if (targetUser.username === "thedigitaltimes" || targetUser.accountType === "official_brand") {
      return res.status(403).json({
        success: false,
        message: "The official broadsheet brand account is protected and cannot be deleted.",
      });
    }

    const targetUserId = targetUser._id;
    const targetUserIdStr = targetUserId.toString();

    // 1. Delete user
    await User.findByIdAndDelete(targetUserId);

    // 2. Cascade delete follows
    await Follow.deleteMany({
      $or: [
        { user: targetUserId },
        { targetId: targetUserIdStr },
        { followedUser: targetUserId },
      ],
    });

    // 3. Cascade delete bookmarks, reading history, notifications, verifications
    await Bookmark.deleteMany({ user: targetUserId });
    await ReadingHistory.deleteMany({ user: targetUserId });
    await Notification.deleteMany({
      $or: [
        { recipient: targetUserId },
        { "metadata.followerId": targetUserId },
      ],
    });
    const VerificationRequest = require("../models/VerificationRequest");
    await VerificationRequest.deleteMany({ applicant: targetUserId });

    res.json({
      success: true,
      message: `Account @${targetUser.username} successfully deleted from MongoDB registry.`,
      deletedId: targetUserId,
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
  discoverUsers,
  getUserProfile,
  getUserFollowers,
  getUserFollowing,
  updateProfile,
  deleteUser,
  getBookmarks,
  addBookmark,
  removeBookmark,
  getReadingHistory,
  recordReadingHistory,
  removeReadingHistoryItem,
  clearReadingHistory,
};
