const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/auth");

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return requireAuth(req, res, next);
  }
  next();
};

// Endpoints
router.get("/unread-count", optionalAuth, getUnreadCount);
router.patch("/read-all", optionalAuth, markAllNotificationsRead);
router.post("/mark-all-read", optionalAuth, markAllNotificationsRead);
router.patch("/:id/read", optionalAuth, markNotificationRead);
router.delete("/:id", optionalAuth, deleteNotification);
router.get("/", optionalAuth, getNotifications);
router.post("/", optionalAuth, createNotification);

module.exports = router;
