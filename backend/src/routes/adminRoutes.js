const express = require("express");
const router = express.Router();
const Source = require("../models/Source");
const { triggerIngestion } = require("../jobs/newsIngestionJob");
const { generateDailyEdition } = require("../jobs/editionJob");

// POST /api/admin/ingest
router.post("/ingest", async (req, res, next) => {
  try {
    const result = await triggerIngestion();
    res.json({
      success: true,
      message: "News ingestion job triggered successfully.",
      result,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/generate-edition
router.post("/generate-edition", async (req, res, next) => {
  try {
    const date = req.body.date || new Date().toISOString().split("T")[0];
    const edition = await generateDailyEdition(date);
    res.json({
      success: true,
      message: `Edition generated for ${date}.`,
      data: edition,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/sources
router.get("/sources", async (req, res, next) => {
  try {
    const sources = await Source.find({}).sort("-createdAt");
    res.json({ success: true, data: sources });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/sources
router.post("/sources", async (req, res, next) => {
  try {
    const source = await Source.create(req.body);
    res.status(201).json({ success: true, data: source });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
