const express = require("express");
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// Public and broadcast notifications
router.get("/", getNotifications);
router.post("/", createNotification);
router.patch("/:id/read", markNotificationRead);
router.post("/mark-all-read", markAllNotificationsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
