const express = require("express");
const router = express.Router();
const {
  followTarget,
  unfollowTarget,
  getFollows,
  getJournalists,
  getJournalistFollowers,
  getDeskFollowers,
} = require("../controllers/followController");
const { requireAuth } = require("../middleware/auth");

// Public endpoints (or optional auth for isFollowing)
router.get("/journalists", async (req, res, next) => {
  // Optional auth
  if (req.headers.authorization) {
    return requireAuth(req, res, () => getJournalists(req, res, next));
  }
  return getJournalists(req, res, next);
});

router.get("/journalists/:id/followers", async (req, res, next) => {
  if (req.headers.authorization) {
    return requireAuth(req, res, () => getJournalistFollowers(req, res, next));
  }
  return getJournalistFollowers(req, res, next);
});

router.get("/desks/:id/followers", async (req, res, next) => {
  if (req.headers.authorization) {
    return requireAuth(req, res, () => getDeskFollowers(req, res, next));
  }
  return getDeskFollowers(req, res, next);
});

// Authenticated endpoints for follows mutations
router.post("/", requireAuth, followTarget);
router.delete("/:id", requireAuth, unfollowTarget);
router.get("/", requireAuth, getFollows);

module.exports = router;
