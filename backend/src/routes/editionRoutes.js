const express = require("express");
const router = express.Router();
const {
  getTodayEdition,
  getEditionArchive,
  getEditionByDate,
  getEditionArticles,
  getEditionDeskArticles,
} = require("../controllers/editionController");

// Specific routes first to prevent collision with parameter routes
router.get("/today", getTodayEdition);
router.get("/archive", getEditionArchive);
router.get("/calendar", getEditionArchive); // backwards-compatible alias

// Explicit /date/:date alias
router.get("/date/:date", getEditionByDate);

// Parametric routes
router.get("/:date", getEditionByDate);
router.get("/:date/articles", getEditionArticles);
router.get("/:date/:desk", getEditionDeskArticles);

module.exports = router;
