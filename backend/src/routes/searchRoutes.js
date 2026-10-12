const express = require("express");
const router = express.Router();
const { searchArticles } = require("../controllers/searchController");
const { searchLimiter } = require("../middleware/rateLimiter");

router.get("/", searchLimiter, searchArticles);

module.exports = router;
