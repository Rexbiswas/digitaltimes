const express = require("express");
const router = express.Router();
const { getPersonalizedFeed } = require("../controllers/feedController");
const { requireAuth } = require("../middleware/auth");

// GET /api/feed
// Supports both authenticated readers (tailored followed feed) and guest readers (curated broadsheet)
router.get("/", async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    return requireAuth(req, res, () => getPersonalizedFeed(req, res, next));
  }
  return getPersonalizedFeed(req, res, next);
});

module.exports = router;
