const {
  triggerIngestionNow,
  triggerEditionRollupNow,
  getSchedulerStatus,
} = require("../services/scheduler/scheduler");

/**
 * POST /api/ingestion/run (or GET /api/ingestion/run)
 * Triggers autonomous news ingestion pipeline on demand
 */
const runIngestion = async (req, res, next) => {
  try {
    const stats = await triggerIngestionNow();
    res.json({
      success: true,
      message: "News ingestion pipeline executed successfully.",
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/ingestion/edition
 * Triggers edition assembly on demand for today or specified date
 */
const runEditionRollup = async (req, res, next) => {
  try {
    const targetDate = req.body.date || req.query.date || null;
    const edition = await triggerEditionRollupNow(targetDate);
    res.json({
      success: true,
      message: "Edition rollup executed successfully.",
      data: edition,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/ingestion/status
 * Returns current status of scheduler and last ingestion run
 */
const getIngestionStatus = (req, res) => {
  const status = getSchedulerStatus();
  res.json({
    success: true,
    data: status,
  });
};

module.exports = {
  runIngestion,
  runEditionRollup,
  getIngestionStatus,
};
