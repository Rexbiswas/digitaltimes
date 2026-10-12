const express = require("express");
const router = express.Router();
const {
  runIngestion,
  runEditionRollup,
  getIngestionStatus,
} = require("../controllers/ingestionController");

// Support both POST and GET on /run for ease of invocation
router.post("/run", runIngestion);
router.get("/run", runIngestion);

// Edition generation trigger
router.post("/edition", runEditionRollup);
router.get("/edition", runEditionRollup);

// Status route
router.get("/status", getIngestionStatus);

module.exports = router;
