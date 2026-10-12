const { runIngestionPipeline } = require("../services/ingestion/ingestionPipeline");

/**
 * Main ingestion routine combining NewsAPI & RSS feeds
 */
const triggerIngestion = async () => {
  return await runIngestionPipeline();
};

/**
 * Start periodic background ingestion worker
 */
const startIngestionJob = (intervalMinutes = 30) => {
  // Run once shortly after startup
  setTimeout(() => {
    triggerIngestion().catch((err) =>
      console.error(`[IngestionJob] Initial run error: ${err.message}`)
    );
  }, 8000);

  // Schedule recurring interval
  const intervalMs = intervalMinutes * 60 * 1000;
  setInterval(() => {
    triggerIngestion().catch((err) =>
      console.error(`[IngestionJob] Interval run error: ${err.message}`)
    );
  }, intervalMs);

  console.log(`[IngestionJob] Worker scheduled to run every ${intervalMinutes} minutes.`);
};

module.exports = {
  triggerIngestion,
  startIngestionJob,
};
