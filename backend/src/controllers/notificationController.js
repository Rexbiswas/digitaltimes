const Notification = require("../models/Notification");
const { emitNotification } = require("../config/socket");

// GET /api/notifications or GET /api/users/notifications
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const { unreadOnly, limit = 50 } = req.query;

    const query = {};
    if (userId) {
      query.$or = [{ user: userId }, { user: null }];
    } else {
      query.user = null;
    }

    if (unreadOnly === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort("-createdAt")
      .limit(parseInt(limit, 10))
      .lean();

    const unreadCount = await Notification.countDocuments({
      ...query,
      read: false,
    });

    res.json({
      success: true,
      total: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications or POST /api/users/notifications
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
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Notification title and message are required.",
      });
    }

    const notification = await Notification.create({
      user: user || (req.user ? req.user._id : null),
      title,
      message,
      type,
      desk: desk.toUpperCase(),
      time,
      articleId: articleId && articleId.match(/^[0-9a-fA-F]{24}$/) ? articleId : null,
      articleCustomId: articleCustomId || (articleId ? String(articleId) : ""),
      story: story || null,
      read: false,
    });

    // Real-time broadcast
    emitNotification(notification);

    res.status(201).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read or /api/users/notifications/:id/read
const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = { _id: id };
    if (req.user) {
      query.$or = [{ user: req.user._id }, { user: null }];
    }

    const notification = await Notification.findOneAndUpdate(
      query,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/notifications/mark-all-read or /api/users/notifications/mark-all-read
const markAllNotificationsRead = async (req, res, next) => {
  try {
    const query = {};
    if (req.user) {
      query.$or = [{ user: req.user._id }, { user: null }];
    } else {
      query.user = null;
    }

    await Notification.updateMany(query, { $set: { read: true } });

    res.json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/notifications/:id or /api/users/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = { _id: id };
    if (req.user) {
      query.$or = [{ user: req.user._id }, { user: null }];
    }

    await Notification.findOneAndDelete(query);

    res.json({
      success: true,
      message: "Notification dismissed successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};
