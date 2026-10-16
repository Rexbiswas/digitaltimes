const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  streamNotifications,
} = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/auth");

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return requireAuth(req, res, next);
  }
  next();
};

// Endpoints
router.get("/stream", optionalAuth, streamNotifications);
router.get("/unread-count", optionalAuth, getUnreadCount);
router.patch("/read-all", requireAuth, markAllNotificationsRead);
router.post("/mark-all-read", requireAuth, markAllNotificationsRead);
router.patch("/:notificationId/read", requireAuth, markNotificationRead);
router.patch("/:id/read", requireAuth, markNotificationRead);
router.delete("/:id", requireAuth, deleteNotification);
router.get("/", optionalAuth, getNotifications);
router.post("/", requireAuth, createNotification);

module.exports = router;
