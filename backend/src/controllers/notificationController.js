const Notification = require("../models/Notification");
const { emitNotification } = require("../config/socket");

// Helper to count authoritative unread notifications for a user without key collisions
const countUnreadNotifications = async (userId) => {
  if (!userId) return 0;
  return await Notification.countDocuments({
    $and: [
      { $or: [{ recipient: userId }, { user: userId }] },
      { $or: [{ isRead: false }, { read: false }] },
    ],
  });
};

// GET /api/notifications
// Paginated notifications for authenticated user, with actor populated
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const { unreadOnly, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Strict authorization: authenticated users get their direct user notifications
    const userClause = userId
      ? { $or: [{ recipient: userId }, { user: userId }] }
      : { recipient: null, user: null };

    const query = {
      $and: [userClause],
    };

    // Exclude notifications from or involving blocked accounts
    if (userId) {
      try {
        const Block = require("../models/Block");
        const blocks = await Block.find({
          $or: [{ blocker: userId }, { blocked: userId }],
        }).lean();
        if (blocks.length > 0) {
          const blockedIds = blocks.map((b) =>
            b.blocker.toString() === userId.toString() ? b.blocked : b.blocker
          );
          const blockedIdStrs = blockedIds.map((id) => id.toString());
          query.$and.push(
            { actor: { $nin: blockedIds } },
            { "metadata.followerId": { $nin: blockedIdStrs } }
          );
        }
      } catch (blockErr) {}
    }

    if (unreadOnly === "true") {
      query.$and.push({ $or: [{ isRead: false }, { read: false }] });
    }

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate("actor", "name username avatar isVerified accountType role")
        .populate("recipient", "name username avatar")
        .sort("-createdAt")
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query),
      countUnreadNotifications(userId),
    ]);

    // Ensure backwards and forward compatibility for each record
    const formatted = notifications.map((n) => ({
      ...n,
      isRead: n.isRead !== undefined ? n.isRead : !!n.read,
      read: n.read !== undefined ? n.read : !!n.isRead,
      actorName: n.actor?.name || n.metadata?.followerName || n.title || "Broadsheet Reader",
      actorUsername: n.actor?.username || n.metadata?.followerUsername || "",
      actorAvatar: n.actor?.avatar || n.metadata?.followerAvatar || null,
    }));

    res.json({
      success: true,
      data: formatted,
      notifications: formatted, // Alias for frontend compatibility
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/notifications/unread-count
// Authoritative unread notification count
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const unreadCount = await countUnreadNotifications(userId);

    res.json({
      success: true,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications
// Create notification manually (editorial alerts or broadcast dispatches)
const createNotification = async (req, res, next) => {
  try {
    const {
      title,
      message,
      type = "breaking",
      desk = "NEWSROOM",
      time = "JUST NOW",
      articleId,
      articleCustomId,
      story,
      user,
      recipient,
      actor,
      link,
      metadata,
    } = req.body;

    if (!title && !message) {
      return res.status(400).json({
        success: false,
        message: "Notification title or message is required.",
      });
    }

    const targetRecipient = recipient || user || (req.user ? req.user._id : null);

    const notification = await Notification.create({
      recipient: targetRecipient,
      user: targetRecipient,
      actor: actor || (req.user ? req.user._id : null),
      title: title || "Broadsheet Alert",
      message: message || title,
      type,
      desk: (desk || "NEWSROOM").toUpperCase(),
      time,
      link: link || "",
      articleId: articleId && articleId.match(/^[0-9a-fA-F]{24}$/) ? articleId : null,
      articleCustomId: articleCustomId || (articleId ? String(articleId) : ""),
      story: story || null,
      isRead: false,
      read: false,
      metadata: metadata || {},
    });

    const populated = await Notification.findById(notification._id)
      .populate("actor", "name username avatar isVerified accountType role")
      .populate("recipient", "name username avatar")
      .lean();

    if (populated && targetRecipient) {
      populated.unreadCount = await countUnreadNotifications(targetRecipient);
    }

    // Real-time broadcast
    emitNotification(populated || notification);

    res.status(201).json({
      success: true,
      data: populated || notification,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read or /api/notifications/:notificationId/read
// Mark single notification as read
const markNotificationRead = async (req, res, next) => {
  try {
    const id = req.params.notificationId || req.params.id;

    const query = { _id: id };
    if (req.user) {
      query.$or = [
        { recipient: req.user._id },
        { user: req.user._id },
        { recipient: null, user: null },
      ];
    }

    const notification = await Notification.findOneAndUpdate(
      query,
      { $set: { isRead: true, read: true } },
      { new: true }
    )
      .populate("actor", "name username avatar isVerified accountType role")
      .populate("recipient", "name username avatar");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or access denied.",
      });
    }

    // Recalculate authoritative unread count
    const userId = req.user ? req.user._id : null;
    const unreadCount = await countUnreadNotifications(userId);

    res.json({
      success: true,
      data: notification,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/read-all or POST /api/notifications/mark-all-read
// Mark all notifications for user as read
const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userFilter = req.user
      ? { $or: [{ recipient: req.user._id }, { user: req.user._id }] }
      : { recipient: null, user: null };

    await Notification.updateMany(userFilter, {
      $set: { isRead: true, read: true },
    });

    res.json({
      success: true,
      message: "All notifications marked as read.",
      unreadCount: 0,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = { _id: id };
    if (req.user) {
      query.$or = [
        { recipient: req.user._id },
        { user: req.user._id },
        { recipient: null, user: null },
      ];
    }

    const deleted = await Notification.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or access denied.",
      });
    }

    // Recalculate authoritative unread count
    const userId = req.user ? req.user._id : null;
    const unreadCount = await countUnreadNotifications(userId);

    res.json({
      success: true,
      message: "Notification dismissed successfully.",
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/notifications/stream
// Server-Sent Events (SSE) stream for real-time notifications on serverless / Vercel
const streamNotifications = (req, res) => {
  const userId = req.user ? req.user._id.toString() : null;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  res.write(`: connected\n\n`);

  const notificationEmitter = require("../services/notificationEmitter");

  const onNotification = (notif) => {
    try {
      const recipientId = notif.recipient
        ? (notif.recipient._id || notif.recipient).toString()
        : notif.user
        ? (notif.user._id || notif.user).toString()
        : null;

      if (!recipientId || (userId && recipientId === userId)) {
        res.write(`data: ${JSON.stringify(notif)}\n\n`);
      }
    } catch (e) {}
  };

  notificationEmitter.on("notification", onNotification);

  const pingTimer = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 15000);

  req.on("close", () => {
    clearInterval(pingTimer);
    notificationEmitter.off("notification", onNotification);
  });
};

module.exports = {
  getNotifications,
  getUnreadCount,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  countUnreadNotifications,
  streamNotifications,
};
