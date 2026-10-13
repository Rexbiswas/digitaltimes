const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/userController");
const {
  getNotifications,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} = require("../controllers/notificationController");
const { requireAuth } = require("../middleware/auth");

router.post("/auth", loginOrRegister);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.get("/profile", requireAuth, getProfile);

// Bookmarks (Clippings)
router.get("/bookmarks", requireAuth, getBookmarks);
router.post("/bookmarks", requireAuth, addBookmark);
router.delete("/bookmarks/:articleId", requireAuth, removeBookmark);

// Reading History
router.get("/history", requireAuth, getReadingHistory);
router.post("/history", requireAuth, recordReadingHistory);
router.delete("/history/:articleId", requireAuth, removeReadingHistoryItem);
router.delete("/history", requireAuth, clearReadingHistory);

// User Notifications
router.get("/notifications", requireAuth, getNotifications);
router.post("/notifications", requireAuth, createNotification);
router.patch("/notifications/:id/read", requireAuth, markNotificationRead);
router.post("/notifications/mark-all-read", requireAuth, markAllNotificationsRead);
router.delete("/notifications/:id", requireAuth, deleteNotification);

module.exports = router;
