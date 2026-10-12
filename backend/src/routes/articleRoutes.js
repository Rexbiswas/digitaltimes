const express = require("express");
const router = express.Router();
const {
  getArticles,
  getArticleByIdOrSlug,
} = require("../controllers/articleController");
const { searchArticles } = require("../controllers/searchController");
const { searchLimiter } = require("../middleware/rateLimiter");

// Note: /search is placed before /:id to prevent route collision
router.get("/search", searchLimiter, searchArticles);
router.get("/", getArticles);
router.get("/:id", getArticleByIdOrSlug);

module.exports = router;
