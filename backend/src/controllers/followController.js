const Follow = require("../models/Follow");
const Article = require("../models/Article");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { getIO } = require("../config/socket");

// POST /api/follows
// Follow a user, desk, or verified author
const followTarget = async (req, res, next) => {
  try {
    const { targetType = "user", targetId, targetName, targetDesk, targetAvatar } = req.body;

    if (!targetType || !["user", "journalist", "desk"].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid targetType. Must be 'user' or 'desk'.",
      });
    }

    if (!targetId || typeof targetId !== "string" || !targetId.trim()) {
      return res.status(400).json({
        success: false,
        message: "targetId is required.",
      });
    }

    const cleanTargetId = targetId.trim();

    // ─────────────────────────────────────────────────────────────
    // 1. USER-TO-USER FOLLOWING FLOW (Instagram Style)
    // ─────────────────────────────────────────────────────────────
    if (targetType === "user" || targetType === "journalist") {
      let targetUser = null;
      if (cleanTargetId.match(/^[0-9a-fA-F]{24}$/)) {
        targetUser = await User.findById(cleanTargetId);
      }
      if (!targetUser) {
        targetUser = await User.findOne({
          username: cleanTargetId.toLowerCase().replace(/^@/, ""),
        });
      }

      if (targetUser) {
        // Prevent users from following themselves
        if (targetUser._id.toString() === req.user._id.toString()) {
          return res.status(400).json({
            success: false,
            message: "Broadsheet guidelines do not permit following your own subscriber profile.",
          });
        }

        // Check if follow already exists
        const existingFollow = await Follow.findOne({
          user: req.user._id,
          targetType: "user",
          targetId: targetUser._id.toString(),
        });

        if (existingFollow) {
          const followerCount = await Follow.countDocuments({
            targetType: "user",
            targetId: targetUser._id.toString(),
          });
          const followingCount = await Follow.countDocuments({
            user: req.user._id,
            targetType: "user",
          });

          return res.status(200).json({
            success: true,
            message: `You are already following @${targetUser.username}.`,
            data: existingFollow,
            isFollowing: true,
            followerCount,
            followingCount,
          });
        }

        // Create follow relationship
        const newFollow = await Follow.create({
          user: req.user._id,
          targetType: "user",
          targetId: targetUser._id.toString(),
          followedUser: targetUser._id,
          targetName: targetUser.name,
          targetAvatar: targetUser.avatar || null,
          targetVerified: !!targetUser.isVerified,
          metadata: {
            username: targetUser.username,
            accountType: targetUser.accountType || "reader",
          },
        });

        const followerCount = await Follow.countDocuments({
          targetType: "user",
          targetId: targetUser._id.toString(),
        });
        const followingCount = await Follow.countDocuments({
          user: req.user._id,
          targetType: "user",
        });

        // Persist notification for the followed user
        let notifRecord = null;
        try {
          notifRecord = await Notification.create({
            recipient: targetUser._id,
            type: "follow",
            title: "New Follower",
            message: `${req.user.name} (@${req.user.username}) started following you.`,
            link: `/user/${req.user.username}`,
            idempotencyKey: `follow_${req.user._id.toString()}_${targetUser._id.toString()}`,
            metadata: {
              followerId: req.user._id,
              followerUsername: req.user.username,
              followerName: req.user.name,
              followerAvatar: req.user.avatar,
            },
          });
        } catch (e) {
          // Ignore idempotency key duplicates
        }

        // Real-time socket events
        try {
          const io = getIO();
          if (io) {
            // To follower
            io.to(`user:${req.user._id.toString()}`).emit("FOLLOW_UPDATED", {
              action: "follow",
              targetType: "user",
              targetId: targetUser._id.toString(),
              targetName: targetUser.name,
              username: targetUser.username,
              followerCount,
              followingCount,
              isFollowing: true,
            });

            // To target followed user
            io.to(`user:${targetUser._id.toString()}`).emit("FOLLOW_UPDATED", {
              action: "new_follower",
              targetType: "user",
              targetId: targetUser._id.toString(),
              followerCount,
            });

            if (notifRecord) {
              io.to(`user:${targetUser._id.toString()}`).emit("NEW_NOTIFICATION", {
                notification: {
                  id: notifRecord._id,
                  type: notifRecord.type,
                  title: notifRecord.title,
                  message: notifRecord.message,
                  link: notifRecord.link,
                  createdAt: notifRecord.createdAt,
                },
              });
            }
          }
        } catch (sockErr) {}

        return res.status(201).json({
          success: true,
          message: `Now following @${targetUser.username}.`,
          data: newFollow,
          isFollowing: true,
          followerCount,
          followingCount,
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. EDITORIAL DESK FOLLOWING FLOW
    // ─────────────────────────────────────────────────────────────
    const cleanTargetName = (targetName && targetName.trim()) || cleanTargetId;

    let follow = await Follow.findOne({
      user: req.user._id,
      targetType: "desk",
      targetId: cleanTargetId,
    });

    if (follow) {
      const followerCount = await Follow.countDocuments({
        targetType: "desk",
        targetId: cleanTargetId,
      });

      return res.status(200).json({
        success: true,
        message: `You are already following the ${cleanTargetName} desk.`,
        data: follow,
        isFollowing: true,
        followerCount,
      });
    }

    follow = await Follow.create({
      user: req.user._id,
      targetType: "desk",
      targetId: cleanTargetId,
      targetName: cleanTargetName,
      targetDesk: targetDesk || cleanTargetId,
      targetAvatar: targetAvatar || null,
    });

    const followerCount = await Follow.countDocuments({
      targetType: "desk",
      targetId: cleanTargetId,
    });

    try {
      const io = getIO();
      if (io) {
        io.to(`user:${req.user._id.toString()}`).emit("FOLLOW_UPDATED", {
          action: "follow",
          targetType: "desk",
          targetId: cleanTargetId,
          targetName: cleanTargetName,
          followerCount,
        });
      }
    } catch (e) {}

    return res.status(201).json({
      success: true,
      message: `Now following the ${cleanTargetName} desk.`,
      data: follow,
      isFollowing: true,
      followerCount,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Follow relationship already established.",
        isFollowing: true,
      });
    }
    next(err);
  }
};

// DELETE /api/follows/:id
// Unfollow user or desk by ObjectId, username, or targetId
const unfollowTarget = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetType } = req.query;

    let follow = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      follow = await Follow.findOne({
        user: req.user._id,
        $or: [{ _id: id }, { targetId: id }, { followedUser: id }],
      });
    }

    if (!follow) {
      // Try by username
      const targetUser = await User.findOne({ username: id.toLowerCase().replace(/^@/, "") });
      if (targetUser) {
        follow = await Follow.findOne({
          user: req.user._id,
          targetType: "user",
          targetId: targetUser._id.toString(),
        });
      }
    }

    if (!follow) {
      const query = { user: req.user._id, targetId: id };
      if (targetType) query.targetType = targetType;
      follow = await Follow.findOne(query);
    }

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: "Follow relationship not found or already removed.",
      });
    }

    const { targetType: fType, targetId: fTargetId, targetName: fTargetName } = follow;
    await Follow.findByIdAndDelete(follow._id);

    const followerCount = await Follow.countDocuments({
      targetType: fType,
      targetId: fTargetId,
    });
    const followingCount = await Follow.countDocuments({
      user: req.user._id,
      targetType: fType,
    });

    // Real-time socket event
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${req.user._id.toString()}`).emit("FOLLOW_UPDATED", {
          action: "unfollow",
          targetType: fType,
          targetId: fTargetId,
          targetName: fTargetName,
          followerCount,
          followingCount,
          isFollowing: false,
        });

        if (fType === "user") {
          io.to(`user:${fTargetId}`).emit("FOLLOW_UPDATED", {
            action: "lost_follower",
            targetType: "user",
            targetId: fTargetId,
            followerCount,
          });
        }
      }
    } catch (e) {}

    res.json({
      success: true,
      message: `Unfollowed ${fTargetName}.`,
      isFollowing: false,
      followerCount,
      followingCount,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/follows
// Get list of followed users and desks for authenticated user
const getFollows = async (req, res, next) => {
  try {
    const { targetType, page = 1, limit = 50 } = req.query;

    const query = { user: req.user._id };
    if (targetType) query.targetType = targetType;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [follows, total] = await Promise.all([
      Follow.find(query).sort("-createdAt").skip(skip).limit(limitNum).lean(),
      Follow.countDocuments(query),
    ]);

    // Gather followed user IDs
    const userTargetIds = follows
      .filter((f) => f.targetType === "user")
      .map((f) => f.targetId)
      .filter((tid) => tid.match(/^[0-9a-fA-F]{24}$/));

    const followedUsers = await User.find({ _id: { $in: userTargetIds } })
      .select("name username avatar bio accountType isVerified verification")
      .lean();

    const usersMap = new Map(followedUsers.map((u) => [u._id.toString(), u]));

    // Attach current follower counts and live user details
    const enriched = await Promise.all(
      follows.map(async (f) => {
        const followerCount = await Follow.countDocuments({
          targetType: f.targetType,
          targetId: f.targetId,
        });

        let userDetails = null;
        if (f.targetType === "user") {
          userDetails = usersMap.get(f.targetId) || null;
        }

        return {
          ...f,
          name: userDetails?.name || f.targetName,
          username: userDetails?.username || f.metadata?.username || null,
          avatar: userDetails?.avatar || f.targetAvatar || null,
          bio: userDetails?.bio || "",
          accountType: userDetails?.accountType || f.metadata?.accountType || "reader",
          isVerified: userDetails ? !!userDetails.isVerified : !!f.targetVerified,
          verification: userDetails?.verification || { status: "unverified" },
          followerCount,
          isFollowing: true,
        };
      })
    );

    const users = enriched.filter((f) => f.targetType === "user");
    const desks = enriched.filter((f) => f.targetType === "desk");
    const journalists = enriched.filter((f) => f.targetType === "journalist");

    res.json({
      success: true,
      data: enriched,
      users,
      desks,
      journalists,
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

// GET /api/journalists
// Return ONLY registered verified journalists, editors, and the official brand account
const getJournalists = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;

    // Query registered verified users, official brand accounts, editors, or staff
    const verifiedUsers = await User.find({
      $or: [
        { accountType: "official_brand" },
        { "verification.status": "verified" },
        { role: { $in: ["editor", "admin"] } },
      ],
    })
      .select("name username email role accountType isVerified verification bio desk organization avatar")
      .sort({ accountType: -1, isVerified: -1, createdAt: 1 })
      .lean();

    const journalistsList = await Promise.all(
      verifiedUsers.map(async (u) => {
        const uIdStr = u._id.toString();
        const followerCount = await Follow.countDocuments({
          targetType: "user",
          targetId: uIdStr,
        });

        let isFollowing = false;
        if (userId) {
          isFollowing = !!(await Follow.exists({
            user: userId,
            targetType: "user",
            targetId: uIdStr,
          }));
        }

        return {
          id: uIdStr,
          _id: uIdStr,
          name: u.name,
          username: u.username,
          desk: (u.desk || "BROADSHEET EDITORIAL").toUpperCase(),
          organization: u.organization || "The Digital Times",
          bio: u.bio || (u.accountType === "official_brand" ? "Official Broadsheet Voice." : "Verified Contributor."),
          followerCount,
          isFollowing,
          verified: !!u.isVerified,
          verificationCategory: u.verification?.category || (u.accountType === "official_brand" ? "publication" : "journalist"),
          accountType: u.accountType || "reader",
          avatar: u.avatar || null,
        };
      })
    );

    res.json({
      success: true,
      total: journalistsList.length,
      data: journalistsList,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/journalists/:id/followers
const getJournalistFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    let targetUserId = id;

    // Resolve username to ObjectId if needed
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      const u = await User.findOne({ username: id.toLowerCase().replace(/^@/, "") });
      if (u) targetUserId = u._id.toString();
    }

    const count = await Follow.countDocuments({
      $or: [
        { targetType: "user", targetId: targetUserId },
        { targetType: "journalist", targetId: id },
      ],
    });

    const isFollowing = req.user
      ? !!(await Follow.findOne({
          user: req.user._id,
          $or: [
            { targetType: "user", targetId: targetUserId },
            { targetType: "journalist", targetId: id },
          ],
        }))
      : false;

    res.json({
      success: true,
      targetId: id,
      targetType: "user",
      followerCount: count,
      isFollowing,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/desks/:id/followers
const getDeskFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanDesk = id.toLowerCase().trim();
    const count = await Follow.countDocuments({
      targetType: "desk",
      targetId: cleanDesk,
    });

    const isFollowing = req.user
      ? !!(await Follow.findOne({
          user: req.user._id,
          targetType: "desk",
          targetId: cleanDesk,
        }))
      : false;

    res.json({
      success: true,
      targetId: cleanDesk,
      targetType: "desk",
      followerCount: count,
      isFollowing,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  followTarget,
  unfollowTarget,
  getFollows,
  getJournalists,
  getJournalistFollowers,
  getDeskFollowers,
};
